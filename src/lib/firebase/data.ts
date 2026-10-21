/**
 * Escritura de datos desde el navegador (sitio estático en Firebase Hosting).
 *
 * Reglas de Firestore (ver firestore.rules):
 * - `posts`: artículos publicados · lectura pública, escritura con clave admin.
 * - `drafts`: borradores y eliminados · invisible para visitantes.
 * - `leads`: creación pública (formulario) · lectura/escritura cerrada.
 *
 * Cómo se autoriza el panel en plan Spark (sin Firebase Auth, que exige
 * facturación): cada escritura viaja con el campo `adminKey`. Las reglas lo
 * comparan con `config/admin.key`, un documento que el cliente no puede leer.
 *
 * La passphrase del navegador ES esa clave: se guarda en localStorage al hacer
 * login (validada contra Firestore) y se adjunta a cada operación.
 */

import { doc, getDoc, getDocs, collection, serverTimestamp, setDoc } from 'firebase/firestore'
import { getClientDb } from '@/lib/firebase/client'
import { COLLECTIONS } from '@/lib/firebase/config'
import { isValidSlug, toPostRecord } from '@/lib/post-format'
import type { PostMeta } from '@/lib/post-format'
import { markPendingChange } from '@/lib/pending-changes'

export type PostInput = PostMeta & { content: string }

// ---------------------------------------------------------------------------
// Login del panel
// ---------------------------------------------------------------------------

const GATE_KEY = 'zentos:admin-gate'

/** Passphrase del panel: se envía como `adminKey` y las reglas la validan. */
const SECRET_PHRASE = process.env.NEXT_PUBLIC_ADMIN_SECRET_PHRASE || ''

function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(GATE_KEY)
  } catch {
    return null
  }
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminKey())
}

/**
 * Verifica la passphrase escribiendo un documento de prueba en `config/verify`.
 * Es la única forma de comprobar la clave sin poder leer `config/admin`: las
 * reglas rechazan la escritura si la clave no coincide.
 */
export async function adminLogin(passphrase: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const db = getClientDb()
  if (!db) return false

  try {
    await setDoc(doc(db, 'config-verify', 'login'), { adminKey: passphrase, at: Date.now() })
  } catch {
    return false
  }

  try {
    window.localStorage.setItem(GATE_KEY, passphrase)
  } catch {
    return false
  }
  return true
}

export function adminLogout(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(GATE_KEY)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Posts (admin)
// ---------------------------------------------------------------------------

function requireDb() {
  const db = getClientDb()
  if (!db) throw new Error('Firebase no está disponible en este navegador.')
  return db
}

function requireAdminKey(): string {
  const key = getAdminKey()
  if (!key) throw new Error('Sesión expirada. Vuelve a iniciar sesión.')
  return key
}

/** Crea o actualiza un post. Si cambia el slug, limpia el documento anterior. */
export async function savePost(input: PostInput, previousSlug?: string): Promise<void> {
  if (!isValidSlug(input.slug)) throw new Error('Slug inválido.')

  const db = requireDb()
  const adminKey = requireAdminKey()
  const record = { ...toPostRecord(input), adminKey, serverUpdatedAt: serverTimestamp() }

  if (input.draft) {
    // Borrador: se guarda en `drafts` (privado, nadie más puede leerlo).
    await setDoc(doc(db, COLLECTIONS.drafts, input.slug), record, { merge: false })
    if (previousSlug && previousSlug !== input.slug && isValidSlug(previousSlug)) {
      await setDoc(doc(db, COLLECTIONS.posts, previousSlug), { adminKey }, { merge: false })
      markPendingChange(previousSlug, 'delete')
    }
    markPendingChange(input.slug, 'create')
    return
  }

  // Publicado: va a `posts` (lectura pública desde el próximo build).
  const wasExisting = (await getDoc(doc(db, COLLECTIONS.posts, input.slug))).exists()
  await setDoc(doc(db, COLLECTIONS.posts, input.slug), record, { merge: false })

  if (previousSlug && previousSlug !== input.slug && isValidSlug(previousSlug)) {
    await setDoc(doc(db, COLLECTIONS.posts, previousSlug), { adminKey }, { merge: false })
    markPendingChange(previousSlug, 'delete')
  }

  markPendingChange(input.slug, wasExisting ? 'update' : 'create')
}

/** Retira un post del blog: se mueve a `drafts`, nunca visible al público. */
export async function removePost(slug: string): Promise<void> {
  if (!isValidSlug(slug)) throw new Error('Slug inválido.')

  const db = requireDb()
  const adminKey = requireAdminKey()

  const existing = await getDoc(doc(db, COLLECTIONS.posts, slug))
  const record = existing.exists()
    ? { ...existing.data(), adminKey, serverUpdatedAt: serverTimestamp() }
    : { adminKey, serverUpdatedAt: serverTimestamp() }

  await setDoc(doc(db, COLLECTIONS.drafts, slug), record, { merge: false })
  // Se reemplaza el documento publicado por un marcador sin contenido.
  await setDoc(doc(db, COLLECTIONS.posts, slug), { adminKey }, { merge: false })

  markPendingChange(slug, 'delete')
}

// ---------------------------------------------------------------------------
// Leads (formulario de contacto)
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type LeadInput = {
  name: string
  email: string
  phone: string
  message: string
}

export async function submitLead(lead: LeadInput): Promise<void> {
  if (lead.name.trim().length < 2) throw new Error('Ingresa tu nombre.')
  if (!EMAIL_RE.test(lead.email)) throw new Error('Ingresa un email válido.')
  if (lead.message.trim().length < 10) {
    throw new Error('Cuéntanos un poco más sobre tu proyecto (mínimo 10 caracteres).')
  }

  const db = requireDb()
  await setDoc(doc(collection(db, COLLECTIONS.leads)), {
    name: lead.name.trim().slice(0, 100),
    email: lead.email.trim().slice(0, 254),
    phone: lead.phone.trim().slice(0, 40),
    message: lead.message.trim().slice(0, 1200),
    createdAt: serverTimestamp(),
    source: 'zentos-web',
  })
}
