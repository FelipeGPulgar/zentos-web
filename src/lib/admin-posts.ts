import { cookies } from 'next/headers'
import { isValidSlug } from '@/lib/blog'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin'

export function isAuthorized(): boolean {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value)
}

export type PostInput = {
  title: string
  description: string
  slug: string
  date: string
  category: string
  tags: string[]
  cover: string
  featured: boolean
  draft: boolean
  content: string
}

export function parsePostInput(
  body: Record<string, unknown>
): { input?: PostInput; error?: string } {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const input: PostInput = {
    title: str(body.title),
    description: str(body.description),
    slug: str(body.slug),
    date: str(body.date),
    category: str(body.category) || 'General',
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => str(t)).filter(Boolean)
      : str(body.tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
    cover: str(body.cover),
    featured: body.featured === true,
    draft: body.draft === true,
    content: typeof body.content === 'string' ? body.content : '',
  }

  if (input.title.length < 3) return { error: 'El título es obligatorio (mínimo 3 caracteres).' }
  if (!isValidSlug(input.slug)) {
    return { error: 'El slug solo puede contener minúsculas, números y guiones.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: 'La fecha debe tener formato YYYY-MM-DD.' }
  }
  if (input.description.length < 10) {
    return { error: 'La descripción es obligatoria (mínimo 10 caracteres).' }
  }
  if (input.content.trim().length < 50) {
    return { error: 'El contenido del artículo es demasiado corto.' }
  }

  return { input }
}
