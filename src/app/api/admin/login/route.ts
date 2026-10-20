import { NextResponse } from 'next/server'
import { checkPassword, createSessionToken, COOKIE_NAME } from '@/lib/admin'

export const runtime = 'nodejs'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutos

type Attempt = { count: number; lockedUntil: number }
const attempts = new Map<string, Attempt>()

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function isLocked(ip: string): number {
  const entry = attempts.get(ip)
  if (!entry) return 0
  if (entry.lockedUntil > Date.now()) {
    return Math.ceil((entry.lockedUntil - Date.now()) / 1000)
  }
  if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
    attempts.delete(ip)
  }
  return 0
}

function recordFailure(ip: string): void {
  const entry = attempts.get(ip) || { count: 0, lockedUntil: 0 }
  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS
    entry.count = 0
  }
  attempts.set(ip, entry)
}

function clearFailures(ip: string): void {
  attempts.delete(ip)
}

export async function POST(request: Request) {
  const ip = getIp(request)

  const lockedSeconds = isLocked(ip)
  if (lockedSeconds > 0) {
    const minutes = Math.ceil(lockedSeconds / 60)
    return NextResponse.json(
      {
        ok: false,
        error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutes} minuto${minutes > 1 ? 's' : ''}.`,
      },
      { status: 429 }
    )
  }

  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!password || !checkPassword(password)) {
    recordFailure(ip)
    const remaining = MAX_ATTEMPTS - (attempts.get(ip)?.count ?? 0)
    return NextResponse.json(
      {
        ok: false,
        error:
          remaining <= 3 && remaining > 0
            ? `Contraseña incorrecta. Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes del bloqueo.`
            : 'Contraseña incorrecta.',
      },
      { status: 401 }
    )
  }

  clearFailures(ip)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}
