import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SECRET_PATH = process.env.ADMIN_SECRET_PATH || '/panel-editorial-9x4k'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Path secreto → /admin/* (el rewrite es interno: la URL no cambia)
  if (pathname === SECRET_PATH || pathname.startsWith(`${SECRET_PATH}/`)) {
    const remainder = pathname.slice(SECRET_PATH.length) || '/'
    const url = request.nextUrl.clone()
    url.pathname = `/admin${remainder}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel-editorial-9x4k/:path*'],
}
