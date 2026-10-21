/**
 * Escritura de datos desde el navegador (sitio estático en Firebase Hosting).
 *
 * Reglas de Firestore (ver firestore.rules):
 * - `posts`: lectura pública (solo publicados) · escritura SOLO para admins.
 * - `leads`: creación pública (formulario) · lectura/escritura cerrada.
 *
 * El "gate" del admin valida una passphrase y la registra en localStorage.
 * Las reglas de Firestore son los que realmente bloquean: si un visitante
 * intenta escribir `posts` sin ser admin, el servidor rechaza la operación.
 */

import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { getClientDb } from '@/lib/firebase/client'
import { COLLECTIONS } from '@/lib/firebase/config'
import { isValidSlug, toPostRecord } from '@/lib/post-format'
import type { PostMeta } from '@/lib/post-format'
import { markPendingChange } from '@/lib/pending-changes'

export type PostInput = PostMeta & { content: string }

// ---------------------------------------------------------------------------
// Gate del admin (passphrase en el navegador)
// ---------------------------------------------------------------------------

const GATE_KEY = 'zentos:admin-gate'
const SECRET_PHRASE = process.env.NEXT_PUBLIC_ADMIN_SECRET_PHRASE || 'zentos-admin'

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(GATE_KEY) === SECRET_PHRASE
  } catch {
    return false
  }
}

export function adminLogin(passphrase: string): boolean {
  if (typeof window === 'undefined') return false
  if (passphrase !== SECRET_PHRASE) return false
  try {
    window.localStorage.setItem(GATE_KEY, SECRET_PHRASE)
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

/** Crea o actualiza un post. Si cambia el slug, renombra el documento. */
export async function savePost(input: PostInput, previousSlug?: string): Promise<void> {
  if (!isValidSlug(input.slug)) throw new Error('Slug inválido.')

  const db = requireDb()
  const posts = collection(db, COLLECTIONS.posts)
  const record = { ...toPostRecord(input), serverUpdatedAt: serverTimestamp() }

  if (previousSlug && previousSlug !== input.slug) {
    if (!isValidSlug(previousSlug)) throw new Error('Slug anterior inválido.')
    const batch = writeBatch(db)
    batch.set(doc(posts, input.slug), record)
    batch.delete(doc(posts, previousSlug))
    await batch.commit()
    markPendingChange(input.slug, 'update')
    return
  }

  const exists = await getDocs(collection(db, COLLECTIONS.posts))
  const wasExisting = exists.docs.some((d) => d.id === input.slug)

  await setDoc(doc(posts, input.slug), record, { merge: false })
  markPendingChange(input.slug, wasExisting ? 'update' : 'create')
}

/** Elimina un post del blog. */
export async function removePost(slug: string): Promise<void> {
  if (!isValidSlug(slug)) throw new Error('Slug inválido.')

  const db = requireDb()
  await deleteDoc(doc(db, COLLECTIONS.posts, slug))
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
