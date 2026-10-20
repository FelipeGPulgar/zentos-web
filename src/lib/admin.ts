import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'zentos_admin'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export { COOKIE_NAME }

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'zentos-dev-session-secret'
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'zentos-admin'
}

function hash(value: string): string {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex')
}

export function checkPassword(candidate: string): boolean {
  const expected = Buffer.from(hash(adminPassword()), 'utf8')
  const received = Buffer.from(hash(candidate), 'utf8')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS
  return `${exp}.${hash(`session:${exp}:${adminPassword()}`)}`
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false
  const [expRaw, sig] = token.split('.')
  const exp = Number(expRaw)
  if (!exp || Number.isNaN(exp) || Date.now() > exp) return false
  const expected = hash(`session:${exp}:${adminPassword()}`)
  const received = sig || ''
  return expected.length === received.length && timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}
