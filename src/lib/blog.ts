/**
 * Capa de datos del blog.
 *
 * - En el navegador (sitio estático en Firebase Hosting) lee con el SDK web.
 * - Durante `next build` lee con el Admin SDK para prerenderizar las páginas.
 * - Sin credenciales, cae a los .md del repo (content/blog).
 *
 * `firebase-admin` se importa de forma dinámica y sólo cuando no estamos en el
 * navegador, para que nunca entre al bundle del cliente.
 */

import {
  buildPost,
  buildPostFromData,
  formatDate,
  isValidSlug,
  sortPosts,
  toPostRecord,
  type Post,
  type PostMeta,
  type PostRecord,
} from '@/lib/post-format'

export { formatDate, isValidSlug, toPostRecord }
export type { Post, PostMeta, PostRecord }

export type PostInput = PostMeta & { content: string }

const isBrowser = typeof window !== 'undefined'

/** Combina los posts publicados con sus borradores (el borrador gana). */
export function mergePublishedWithDrafts(published: Post[], drafts: Post[]): Post[] {
  const draftSlugs = new Set(drafts.map((d) => d.slug))
  return [...published.filter((p) => !draftSlugs.has(p.slug)), ...drafts]
}

// ---------------------------------------------------------------------------
// Fuentes de datos
// ---------------------------------------------------------------------------

async function readFromClient(includeDrafts: boolean): Promise<Post[] | null> {
  try {
    const { getClientDb } = await import('@/lib/firebase/client')
    const { collection, getDocs } = await import('firebase/firestore')
    const db = getClientDb()
    if (!db) return null

    // `posts` es público; `drafts` solo se puede leer siendo admin (las reglas
    // lo bloquean para visitantes, así que la lectura falla y se ignora).
    const published = (await getDocs(collection(db, 'posts'))).docs
      .map((doc) => buildPostFromData(doc.id, doc.data()))
      .filter((p) => Boolean(p.title) && !p.draft)

    if (!includeDrafts) return sortPosts(published)

    let drafts: Post[] = []
    try {
      drafts = (await getDocs(collection(db, 'drafts'))).docs.map((doc) =>
        buildPostFromData(doc.id, { ...doc.data(), draft: true })
      )
    } catch {
      // Visitante sin clave admin: no puede leer borradores (correcto).
    }

    return sortPosts(mergePublishedWithDrafts(published, drafts))
  } catch (err) {
    console.error('[blog] lectura desde Firestore (web) falló:', err)
    return null
  }
}

async function readFromAdmin(includeDrafts: boolean): Promise<Post[] | null> {
  try {
    // El lector con Admin SDK vive en un `.mjs` de Node (scripts/): así no
    // depende de la resolución de módulos de webpack ni del alias "@/...".
    // webpackIgnore evita que webpack intente empaquetarlo en el navegador.
    const load = (m: string) => import(/* webpackIgnore: true */ m)
    const url = (await load('node:url')) as typeof import('url')
    const pathMod = (await load('node:path')) as typeof import('path')
    const file = url.pathToFileURL(
      pathMod.join(process.cwd(), 'scripts', 'blog-admin.mjs')
    ).href

    const mod = (await load(file)) as {
      getAllPostsFromAdmin: (
        drafts: boolean
      ) => Promise<Array<{ slug: string; data: Record<string, unknown> }>>
    }
    const records = await mod.getAllPostsFromAdmin(includeDrafts)
    const posts = records.map((r) => buildPostFromData(r.slug, r.data))
    return sortPosts(posts)
  } catch (err) {
    console.error('[blog] lectura con el Admin SDK falló:', err)
    return null
  }
}

async function readFromFs(includeDrafts: boolean): Promise<Post[]> {
  try {
    // Solo build/Node: import opaco para no arrastrar `fs` al navegador.
    const load = (m: string) => import(/* webpackIgnore: true */ m)
    const fs = (await load('node:fs/promises')) as typeof import('fs/promises')
    const pathMod = (await load('node:path')) as typeof import('path')

    const contentDir = pathMod.join(process.cwd(), 'content', 'blog')
    const entries = await fs.readdir(contentDir, { withFileTypes: true })

    const posts = await Promise.all(
      entries
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map(async (e) => {
          const slug = e.name.replace(/\.md$/, '')
          return buildPost(slug, await fs.readFile(pathMod.join(contentDir, e.name), 'utf8'))
        })
    )

    return sortPosts(includeDrafts ? posts : posts.filter((p) => !p.draft))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// API pública (misma firma que antes de migrar a estático)
// ---------------------------------------------------------------------------

export async function getAllPosts(options?: { includeDrafts?: boolean }): Promise<Post[]> {
  const includeDrafts = Boolean(options?.includeDrafts)

  const fromClient = isBrowser ? await readFromClient(includeDrafts) : null
  if (fromClient) return fromClient

  const fromAdmin = await readFromAdmin(includeDrafts)
  if (fromAdmin) return fromAdmin

  return readFromFs(includeDrafts)
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!isValidSlug(slug)) return undefined

  const fromStore = await getPostIncludingDrafts(slug)
  if (fromStore) return fromStore.draft ? undefined : fromStore

  const fromFs = await readPostFromFs(slug)
  return fromFs?.draft ? undefined : fromFs
}

/** Lee un .md del repo (solo build/Node; import opaco para no arrastrar `fs`). */
async function readPostFromFs(slug: string): Promise<Post | undefined> {
  try {
    const load = (m: string) => import(/* webpackIgnore: true */ m)
    const fs = (await load('node:fs/promises')) as typeof import('fs/promises')
    const pathMod = (await load('node:path')) as typeof import('path')
    const file = pathMod.join(process.cwd(), 'content', 'blog', `${slug}.md`)
    return buildPost(slug, await fs.readFile(file, 'utf8'))
  } catch {
    return undefined
  }
}

/** Igual que getPost pero incluyendo borradores (uso interno del admin). */
export async function getPostIncludingDrafts(
  slug: string
): Promise<(Post & { content: string }) | null> {
  if (!isValidSlug(slug)) return null

  const withContent = (data: Record<string, unknown>, id: string) => ({
    ...buildPostFromData(id, data),
    content: typeof data.content === 'string' ? data.content : '',
  })

  try {
    if (isBrowser) {
      const { getClientDb } = await import('@/lib/firebase/client')
      const { doc, getDoc } = await import('firebase/firestore')
      const db = getClientDb()
      if (db) {
        // Un borrador vive en `drafts`; el admin puede leer ambas colecciones.
        const draftSnap = await getDoc(doc(db, 'drafts', slug)).catch(() => null)
        if (draftSnap?.exists()) return withContent(draftSnap.data(), draftSnap.id)

        const snap = await getDoc(doc(db, 'posts', slug))
        if (snap.exists() && snap.data().title) return withContent(snap.data(), snap.id)
      }
    } else {
      const load = (m: string) => import(/* webpackIgnore: true */ m)
      const url = (await load('node:url')) as typeof import('url')
      const pathMod = (await load('node:path')) as typeof import('path')
      const file = url.pathToFileURL(
        pathMod.join(process.cwd(), 'scripts', 'blog-admin.mjs')
      ).href
      const mod = (await load(file)) as {
        getPostFromAdmin: (
          slug: string
        ) => Promise<{ slug: string; data: Record<string, unknown> } | null>
      }
      const record = await mod.getPostFromAdmin(slug)
      return record ? withContent(record.data, record.slug) : null
    }
  } catch (err) {
    console.error('[blog] no se pudo leer el post:', err)
  }

  return null
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

/** Devuelve el markdown crudo (sin frontmatter) de un post — para el admin. */
export async function getRawContent(slug: string): Promise<string | null> {
  if (!isValidSlug(slug)) return null

  const post = await getPostIncludingDrafts(slug)
  if (post) return post.content.trim() || null

  try {
    const load = (m: string) => import(/* webpackIgnore: true */ m)
    const fs = (await load('node:fs/promises')) as typeof import('fs/promises')
    const pathMod = (await load('node:path')) as typeof import('path')
    const raw = await fs.readFile(
      pathMod.join(process.cwd(), 'content', 'blog', `${slug}.md`),
      'utf8'
    )
    const bodyMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/)
    return (bodyMatch ? bodyMatch[1] : raw).trim()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Marcado de "hay cambios sin publicar" (sitio estático)
// ---------------------------------------------------------------------------

export {
  markPendingChange,
  getPendingChanges,
  clearPendingChanges,
  type PendingChanges,
} from '@/lib/pending-changes'
