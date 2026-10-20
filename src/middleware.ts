import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEFAULT_SECRET = '/panel-editorial-9x4k'

function getSecretPath(): string {
  return process.env.ADMIN_SECRET_PATH || DEFAULT_SECRET
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = getSecretPath()

  // Bloquear acceso directo a /admin (páginas) — 404 real
  // Las APIs /api/admin/* NO se bloquean aquí: ya tienen auth en cada ruta
  if (pathname.startsWith('/admin')) {
    return new NextResponse(null, { status: 404 })
  }

  // Path secreto → reescribir a /admin/* (páginas)
  if (pathname === secret || pathname.startsWith(`${secret}/`)) {
    const remainder = pathname.slice(secret.length) || '/'
    const url = request.nextUrl.clone()
    url.pathname = `/admin${remainder}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/panel-editorial-9x4k/:path*'],
}
