import { NextResponse } from 'next/server'
import { appendFile, mkdir } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const LIMITS = { name: 100, email: 254, phone: 40, message: 1200 } as const
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5

const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
}

async function notify(lead: Record<string, string>) {
  const url = process.env.CONTACT_WEBHOOK_URL
  if (!url) return

  const text = [
    '**Nuevo contacto desde zentos.cl**',
    `Nombre: ${lead.name}`,
    `Email: ${lead.email}`,
    `Teléfono: ${lead.phone || 'No indicado'}`,
    '',
    lead.message,
  ].join('\n')

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text, text, ...lead, event: 'contact' }),
    signal: AbortSignal.timeout(5000),
  })
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Demasiados intentos. Intenta nuevamente en unos minutos.' },
      { status: 429 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const lead = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    message: clean(body.message, LIMITS.message),
  }

  if (lead.name.length < 2) {
    return NextResponse.json({ ok: false, error: 'Ingresa tu nombre.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(lead.email)) {
    return NextResponse.json({ ok: false, error: 'Ingresa un email válido.' }, { status: 400 })
  }
  if (lead.message.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Cuéntanos un poco más sobre tu proyecto (mínimo 10 caracteres).' },
      { status: 400 }
    )
  }

  const entry = JSON.stringify({ ...lead, ip, createdAt: new Date().toISOString() })

  try {
    const { getDb } = await import('@/lib/firebase/server')
    const db = getDb()

    if (db) {
      await db.collection('leads').add({ ...lead, ip, createdAt: new Date().toISOString() })
    } else {
      throw new Error('Firestore no configurado: se usa fallback a archivo')
    }
  } catch (err) {
    // Fallback: archivo local (dev sin credenciales / Firestore caído)
    console.error('[contact] Firestore no disponible, guardando en archivo:', err)
    try {
      await mkdir(path.join(process.cwd(), 'data'), { recursive: true })
      await appendFile(path.join(process.cwd(), 'data', 'leads.jsonl'), `${entry}\n`, 'utf8')
    } catch (fileErr) {
      console.error('[contact] no se pudo guardar el lead:', fileErr)
    }
  }

  try {
    await notify(lead)
  } catch (err) {
    console.error('[contact] falló la notificación:', err)
  }

  return NextResponse.json({ ok: true })
}
