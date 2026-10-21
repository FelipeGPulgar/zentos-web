/**
 * Cliente de Firebase para el navegador (SDK web).
 *
 * En modo estático (export) TODO el acceso a datos ocurre desde el navegador:
 * - Lectura pública de `posts` (solo publicados) y escritura de `leads`.
 * - El panel del admin usa el mismo cliente; la escritura de `posts` está
 *   protegida por las reglas de Firestore (ver firestore.rules).
 *
 * En servidor (build/render) no se inicializa: devuelve null.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { firebaseConfig } from './config'

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (app) return app
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  return app
}

export function getClientDb(): Firestore | null {
  const current = getFirebaseApp()
  return current ? getFirestore(current) : null
}

export function getClientStorage(): FirebaseStorage | null {
  const current = getFirebaseApp()
  return current ? getStorage(current) : null
}
