/**
 * Parseo puro de contenido (sin dependencias de servidor ni de navegador).
 * Separado de `blog.ts` para que sea seguro importarlo desde cualquier lado.
 */

import { marked } from 'marked'

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

/** Campos persistidos en Firestore (colección `posts`, id = slug). */
export type PostRecord = Omit<PostMeta, 'slug'> & {
  content: string
  updatedAt: number
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
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

function toPost(slug: string, data: Record<string, unknown>, body: string): Post {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const title = typeof data.title === 'string' ? data.title : slug
  const tags = Array.isArray(data.tags)
    ? (data.tags as unknown[]).filter((t): t is string => typeof t === 'string')
    : []

  return {
    slug,
    title,
    description: typeof data.description === 'string' ? data.description : '',
    date: typeof data.date === 'string' ? data.date : '2026-01-01',
    category: typeof data.category === 'string' ? data.category : 'General',
    tags,
    cover: typeof data.cover === 'string' ? data.cover : '',
    featured: data.featured === true,
    draft: data.draft === true,
    html: marked.parse(body, { async: false, gfm: true }),
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  }
}

/** Construye un Post desde el markdown con frontmatter (.md del repo). */
export function buildPost(slug: string, raw: string): Post {
  const { data, body } = parseFrontmatter(raw)
  const tags = (data.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return toPost(slug, { ...data, tags, featured: data.featured === 'true', draft: data.draft === 'true' }, body)
}

/** Construye un Post desde un documento de Firestore. */
export function buildPostFromData(slug: string, data: Record<string, unknown>): Post {
  const body = typeof data.content === 'string' ? data.content : ''
  return toPost(slug, data, body)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date(y, m - 1, d))
}

export function sortPosts(posts: Post[]): Post[] {
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** Convierte el input del admin al documento que se guarda en Firestore. */
export function toPostRecord(input: PostMeta & { content: string }): PostRecord {
  return {
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
}
