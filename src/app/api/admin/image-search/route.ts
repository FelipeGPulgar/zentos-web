import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin'

export const runtime = 'nodejs'

type UnsplashResult = {
  id: string
  urls: { small: string; regular: string }
  alt_description: string | null
  user: { name: string }
  links: { html: string }
}

export async function GET(request: Request) {
  if (!verifySessionToken(cookies().get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim().slice(0, 100) || ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!query) {
    return NextResponse.json({ ok: false, error: 'Falta la búsqueda.' }, { status: 400 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json(
      {
        ok: false,
        needsKey: true,
        error:
          'Configura UNSPLASH_ACCESS_KEY en .env.local (gratis en https://unsplash.com/developers).',
      },
      { status: 503 }
    )
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.set('query', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', '12')
    url.searchParams.set('orientation', 'landscape')

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[image-search] Unsplash error:', res.status, text)
      return NextResponse.json(
        { ok: false, error: 'El servicio de imágenes no respondió. Intenta de nuevo.' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const results = (data.results as UnsplashResult[]).map((r) => ({
      id: r.id,
      thumb: r.urls.small,
      full: r.urls.regular,
      alt: r.alt_description || query,
      author: r.user.name,
      sourceUrl: r.links.html,
    }))

    return NextResponse.json({
      ok: true,
      results,
      page,
      totalPages: Math.min(10, Math.ceil((data.total || 0) / 12)),
    })
  } catch (err) {
    console.error('[image-search] error:', err)
    return NextResponse.json(
      { ok: false, error: 'Error al buscar imágenes. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
