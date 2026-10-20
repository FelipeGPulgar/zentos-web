import { readdir, readFile, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { marked } from 'marked'
import { getDb } from '@/lib/firebase/server'

export type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  cover: string
  featured: boolean
  draft: boolean
}

export type Post = PostMeta & {
  html: string
  readingMinutes: number
}

/** Campos que se persisten en Firestore (colección `posts`, id = slug). */
export type PostRecord = Omit<PostMeta, 'slug'> & {
  content: string
  updatedAt: number
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value) as string
      } catch {
        // valor con comillas inválidas: se usa tal cual
      }
    }
    data[key] = value
  }
  return { data, body: match[2] }
}

function buildPost(slug: string, raw: string): Post {
  const { data, body } = parseFrontmatter(raw)
  const tags = (data.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const words = body.trim() ? body.trim().split(/\s+/).length : 0

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || '2026-01-01',
    category: data.category || 'General',
    tags,
    cover: data.cover || '',
    featured: data.featured === 'true',
    draft: data.draft === 'true',
    html: marked.parse(body, { async: false, gfm: true }),
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  }
}

function buildPostFromRecord(slug: string, record: PostRecord): Post {
  const body = record.content || ''
  const words = body.trim() ? body.trim().split(/\s+/).length : 0

  return {
    slug,
    title: record.title || slug,
    description: record.description || '',
    date: record.date || '2026-01-01',
    category: record.category || 'General',
    tags: Array.isArray(record.tags) ? record.tags : [],
    cover: record.cover || '',
    featured: Boolean(record.featured),
    draft: Boolean(record.draft),
    html: marked.parse(body, { async: false, gfm: true }),
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  }
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date(y, m - 1, d))
}

function sortPosts(posts: Post[]): Post[] {
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

// ---------------------------------------------------------------------------
// Lectura desde filesystem (fallback local sin credenciales de Firebase)
// ---------------------------------------------------------------------------

async function getAllPostsFromFs(options?: { includeDrafts?: boolean }): Promise<Post[]> {
  let entries
  try {
    entries = await readdir(CONTENT_DIR, { withFileTypes: true })
  } catch {
    return []
  }

  const posts = await Promise.all(
    entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map(async (e) => {
        const slug = e.name.replace(/\.md$/, '')
        const raw = await readFile(path.join(CONTENT_DIR, e.name), 'utf8')
        return buildPost(slug, raw)
      })
  )

  const visible = options?.includeDrafts ? posts : posts.filter((p) => !p.draft)
  return sortPosts(visible)
}

async function getPostFromFs(slug: string): Promise<Post | undefined> {
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
    const post = buildPost(slug, raw)
    return post.draft ? undefined : post
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Lectura (Firestore primero, fallback a filesystem)
// ---------------------------------------------------------------------------

export async function getAllPosts(options?: { includeDrafts?: boolean }): Promise<Post[]> {
  const db = getDb()

  if (db) {
    try {
      const snapshot = await db.collection('posts').get()
      const posts = snapshot.docs.map((doc) =>
        buildPostFromRecord(doc.id, doc.data() as PostRecord)
      )
      const visible = options?.includeDrafts ? posts : posts.filter((p) => !p.draft)
      return sortPosts(visible)
    } catch (err) {
      console.error('[blog] error leyendo posts de Firestore, usando filesystem:', err)
    }
  }

  return getAllPostsFromFs(options)
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!isValidSlug(slug)) return undefined

  const db = getDb()
  if (db) {
    try {
      const doc = await db.collection('posts').doc(slug).get()
      if (doc.exists) {
        const post = buildPostFromRecord(doc.id, doc.data() as PostRecord)
        return post.draft ? undefined : post
      }
      // No está en Firestore: puede que la migración no se haya ejecutado aún
      return getPostFromFs(slug)
    } catch (err) {
      console.error('[blog] error leyendo post de Firestore, usando filesystem:', err)
    }
  }

  return getPostFromFs(slug)
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

/** Devuelve el markdown crudo (sin frontmatter) de un post — para el admin. */
export async function getRawContent(slug: string): Promise<string | null> {
  if (!isValidSlug(slug)) return null

  const db = getDb()
  if (db) {
    try {
      const doc = await db.collection('posts').doc(slug).get()
      if (doc.exists) {
        return ((doc.data() as PostRecord).content || '').trim()
      }
    } catch (err) {
      console.error('[blog] error leyendo contenido de Firestore, usando filesystem:', err)
    }
  }

  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
    const bodyMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/)
    return (bodyMatch ? bodyMatch[1] : raw).trim()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Escritura (Firestore si está configurado, si no filesystem)
// ---------------------------------------------------------------------------

export function serializePost(
  meta: Omit<PostMeta, 'slug'>,
  content: string
): string {
  const front = [
    '---',
    `title: ${JSON.stringify(meta.title)}`,
    `description: ${JSON.stringify(meta.description)}`,
    `date: ${meta.date}`,
    `category: ${JSON.stringify(meta.category)}`,
    `tags: ${meta.tags.join(', ')}`,
    `cover: ${JSON.stringify(meta.cover)}`,
    `featured: ${meta.featured}`,
    `draft: ${meta.draft}`,
    '---',
  ].join('\n')
  return `${front}\n\n${content.trim()}\n`
}

export type PostInput = PostMeta & { content: string }

/**
 * Crea o actualiza un post. Si `previousSlug` difiere de `input.slug`
 * (el admin cambió el slug), renombra el documento/archivo.
 * Lanza excepción si no se pudo guardar.
 */
export async function savePost(input: PostInput, previousSlug?: string): Promise<void> {
  const db = getDb()

  if (db) {
    const record: PostRecord = {
      title: input.title,
      description: input.description,
      date: input.date,
      category: input.category,
      tags: input.tags,
      cover: input.cover,
      featured: input.featured,
      draft: input.draft,
      content: input.content.trim(),
      updatedAt: Date.now(),
    }

    const posts = db.collection('posts')
    if (previousSlug && previousSlug !== input.slug) {
      const batch = db.batch()
      batch.set(posts.doc(input.slug), record)
      batch.delete(posts.doc(previousSlug))
      await batch.commit()
    } else {
      await posts.doc(input.slug).set(record)
    }
    return
  }

  // Fallback filesystem
  await writeFile(
    path.join(CONTENT_DIR, `${input.slug}.md`),
    serializePost(input, input.content),
    'utf8'
  )
  if (previousSlug && previousSlug !== input.slug) {
    await unlink(path.join(CONTENT_DIR, `${previousSlug}.md`)).catch(() => undefined)
  }
}

/** Elimina un post. Lanza excepción si no existía. */
export async function removePost(slug: string): Promise<void> {
  const db = getDb()

  if (db) {
    const ref = db.collection('posts').doc(slug)
    const doc = await ref.get()
    if (!doc.exists) throw new Error('El artículo no existe.')
    await ref.delete()
    return
  }

  await unlink(path.join(CONTENT_DIR, `${slug}.md`))
}
