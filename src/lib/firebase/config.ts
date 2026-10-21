/**
 * Configuración pública del SDK web de Firebase.
 *
 * Las llaves web de Firebase no son secretas: la seguridad real la dan las
 * reglas de Firestore/Storage (ver firestore.rules).
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBx_zyc00hhD4xWNJlahB6XNfCZCg3Cbks',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zentos-eeca4.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zentos-eeca4',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zentos-eeca4.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '776367388112',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:776367388112:web:88cbf882635cbe4241b5d5',
}

/** Colecciones de Firestore usadas por el sitio. */
export const COLLECTIONS = {
  posts: 'posts',
  drafts: 'drafts',
  leads: 'leads',
} as const
