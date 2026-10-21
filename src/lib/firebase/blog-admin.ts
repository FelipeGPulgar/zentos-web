/**
 * Lectura con el Admin SDK — SOLO servidor/build.
 *
 * Importa `firebase-admin` (usa APIs de Node como `net`), así que nunca debe
 * entrar al bundle del navegador. Se importa de forma dinámica desde `blog.ts`
 * únicamente cuando `window` no existe (build y scripts).
 */

import { getDb } from '@/lib/firebase/server'
import { buildPostFromData, sortPosts, type Post } from '@/lib/post-format'

export async function getAllPostsFromAdmin(includeDrafts: boolean): Promise<Post[] | null> {
  const db = getDb()
  if (!db) return null

  const snapshot = await db.collection('posts').get()
  const posts = snapshot.docs.map((doc) => buildPostFromData(doc.id, doc.data()))
  return sortPosts(includeDrafts ? posts : posts.filter((p) => !p.draft))
}

export async function getPostFromAdmin(
  slug: string
): Promise<(Post & { content: string }) | null> {
  const db = getDb()
  if (!db) return null

  const doc = await db.collection('posts').doc(slug).get()
  if (!doc.exists) return null

  const data = doc.data() as Record<string, unknown>
  return {
    ...buildPostFromData(doc.id, data),
    content: typeof data.content === 'string' ? data.content : '',
  }
}
