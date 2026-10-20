import { readdir, readFile } from 'fs/promises'
import path from 'path'
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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date(y, m - 1, d))
}

export async function getAllPosts(options?: { includeDrafts?: boolean }): Promise<Post[]> {
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
  return visible.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!isValidSlug(slug)) return undefined
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
    const post = buildPost(slug, raw)
    return post.draft ? undefined : post
  } catch {
    return undefined
  }
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

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
