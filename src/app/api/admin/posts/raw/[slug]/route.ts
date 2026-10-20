import { NextResponse } from 'next/server'
import { getRawContent, isValidSlug } from '@/lib/blog'
import { isAuthorized } from '@/lib/admin-posts'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const slug = params.slug
  if (!isValidSlug(slug)) {
    return NextResponse.json({ ok: false, error: 'Slug inválido.' }, { status: 400 })
  }

  const content = await getRawContent(slug)
  if (content === null) {
    return NextResponse.json({ ok: false, error: 'Artículo no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, content })
}
