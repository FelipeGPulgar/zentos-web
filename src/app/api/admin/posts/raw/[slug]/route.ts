import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { isValidSlug } from '@/lib/blog'
import { isAuthorized } from '@/lib/admin-posts'

export const runtime = 'nodejs'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const slug = params.slug
  if (!isValidSlug(slug)) {
    return NextResponse.json({ ok: false, error: 'Slug inválido.' }, { status: 400 })
  }

  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
    const bodyMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/)
    const content = bodyMatch ? bodyMatch[1].trim() : raw
    return NextResponse.json({ ok: true, content })
  } catch {
    return NextResponse.json({ ok: false, error: 'Artículo no encontrado.' }, { status: 404 })
  }
}
