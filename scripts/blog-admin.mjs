/**
 * Lector de Firestore con el Admin SDK para el BUILD.
 *
 * Vive fuera de `src/` a propósito: es un módulo `.mjs` de Node que no pasa por
 * webpack. `src/lib/blog.ts` lo importa por ruta absoluta durante `next build`
 * (con `webpackIgnore`), así `firebase-admin` nunca entra al bundle del
 * navegador y no hay problemas de alias "@/...".
 *
 * Devuelve los datos crudos de Firestore: el parseo lo hace `post-format.ts`.
 */

import { readFileSync } from 'fs'
import path from 'path'
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const LOCAL_KEY = path.join(process.cwd(), 'firebase-service-account.local.json')

function getDb() {
  if (getApps().length === 0) {
    const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT
    if (fromEnv) {
      const cred = JSON.parse(fromEnv)
      initializeApp({ credential: cert(cred), projectId: cred.project_id })
    } else {
      try {
        const cred = JSON.parse(readFileSync(LOCAL_KEY, 'utf8'))
        initializeApp({ credential: cert(cred), projectId: cred.project_id })
      } catch {
        initializeApp({
          credential: applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID || 'zentos-eeca4',
        })
      }
    }
  }
  return getFirestore()
}

/** Posts publicados (o publicados + borradores si `includeDrafts`). */
export async function getAllPostsFromAdmin(includeDrafts) {
  const db = getDb()

  const snapshot = await db.collection('posts').get()
  const published = snapshot.docs
    .filter((doc) => doc.data().title)
    .map((doc) => ({ slug: doc.id, data: doc.data() }))

  if (!includeDrafts) return published

  const drafts = (await db.collection('drafts').get()).docs.map((doc) => ({
    slug: doc.id,
    data: { ...doc.data(), draft: true },
  }))

  const draftSlugs = new Set(drafts.map((d) => d.slug))
  return [...published.filter((p) => !draftSlugs.has(p.slug)), ...drafts]
}

/** Un post (borrador primero) con su contenido markdown. */
export async function getPostFromAdmin(slug) {
  const db = getDb()

  const draft = await db.collection('drafts').doc(slug).get()
  if (draft.exists) {
    const data = draft.data() || {}
    return { slug: draft.id, data: { ...data, draft: true } }
  }

  const doc = await db.collection('posts').doc(slug).get()
  if (!doc.exists) return null
  const data = doc.data() || {}
  if (!data.title) return null

  return { slug: doc.id, data }
}
