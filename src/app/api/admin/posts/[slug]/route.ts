import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { savePost, removePost } from '@/lib/blog'
import { isAuthorized, parsePostInput } from '@/lib/admin-posts'

export const runtime = 'nodejs'

type Params = { params: { slug: string } }

export async function PUT(request: Request, { params }: Params) {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const oldSlug = params.slug
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  const { input, error } = parsePostInput(body)
  if (!input || error) {
    return NextResponse.json({ ok: false, error: error || 'Datos inválidos.' }, { status: 400 })
  }

  try {
    await savePost(input, oldSlug)
  } catch (err) {
    console.error('[admin/posts] error al actualizar:', err)
    return NextResponse.json(
      { ok: false, error: 'No se pudo guardar los cambios.' },
      { status: 500 }
    )
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${oldSlug}`)
  revalidatePath(`/blog/${input.slug}`)
  return NextResponse.json({ ok: true, slug: input.slug })
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const slug = params.slug
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'Slug inválido.' }, { status: 400 })
  }

  try {
    await removePost(slug)
  } catch {
    return NextResponse.json({ ok: false, error: 'El artículo no existe.' }, { status: 404 })
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  return NextResponse.json({ ok: true })
}
