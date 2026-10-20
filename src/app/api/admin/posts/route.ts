import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAllPosts, savePost } from '@/lib/blog'
import { isAuthorized, parsePostInput } from '@/lib/admin-posts'

export const runtime = 'nodejs'

export async function GET() {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const posts = await getAllPosts({ includeDrafts: true })
  return NextResponse.json({
    ok: true,
    posts: posts.map(({ html, ...meta }) => meta),
  })
}

export async function POST(request: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

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
    await savePost(input)
  } catch (err) {
    console.error('[admin/posts] error al crear:', err)
    return NextResponse.json(
      { ok: false, error: 'No se pudo guardar el artículo.' },
      { status: 500 }
    )
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${input.slug}`)
  return NextResponse.json({ ok: true, slug: input.slug })
}
