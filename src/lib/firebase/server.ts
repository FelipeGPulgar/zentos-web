import { existsSync } from 'fs'
import { getApps, initializeApp, cert, applicationDefault, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

type Bucket = ReturnType<ReturnType<typeof getStorage>['bucket']>

/**
 * Inicialización de Firebase Admin para zentos-web.
 *
 * Modo de operación dual:
 * - Con credenciales (App Hosting, GOOGLE_APPLICATION_CREDENTIALS o
 *   FIREBASE_SERVICE_ACCOUNT) → Firestore y Storage son la fuente de verdad.
 * - Sin credenciales (dev local sin setup) → el código cae en fallback al
 *   filesystem (content/blog/*.md y public/blog/) como siempre.
 */

const DEFAULT_BUCKET = 'zentos-eeca4.firebasestorage.app'

let app: App | null = null
let initError: unknown = null

/** Detecta si hay credenciales disponibles para firebase-admin. */
export function hasFirebaseCredentials(): boolean {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return true

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (keyFile && existsSync(keyFile)) return true

  // Entornos gestionados por Google (App Hosting / Cloud Run / Cloud Functions)
  // proveen Application Default Credentials automáticamente.
  if (process.env.K_SERVICE || process.env.FIREBASE_CONFIG || process.env.FIREBASE_APPHOSTING_BRANCH) {
    return true
  }

  return false
}

export function getStorageBucketName(): string {
  return process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_BUCKET
}

function getAdminApp(): App | null {
  if (app) return app
  if (initError) return null
  if (getApps().length > 0) {
    app = getApps()[0]
    return app
  }

  try {
    const bucket = getStorageBucketName()
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

    app = initializeApp(
      serviceAccount
        ? {
            credential: cert(JSON.parse(serviceAccount.replace(/\\n/g, '\n'))),
            storageBucket: bucket,
          }
        : {
            credential: applicationDefault(),
            storageBucket: bucket,
          }
    )
    return app
  } catch (err) {
    initError = err
    console.error('[firebase] no se pudo inicializar el Admin SDK:', err)
    return null
  }
}

/**
 * Devuelve la instancia de Firestore, o null si Firebase no está configurado
 * (en ese caso el llamador debe usar el fallback a filesystem).
 */
export function getDb(): Firestore | null {
  if (!hasFirebaseCredentials()) return null
  const currentApp = getAdminApp()
  if (!currentApp) return null

  try {
    return getFirestore(currentApp)
  } catch (err) {
    console.error('[firebase] no se pudo obtener Firestore:', err)
    return null
  }
}

/**
 * Devuelve el bucket de Cloud Storage, o null si no está disponible.
 */
export function getBucket(): Bucket | null {
  if (!hasFirebaseCredentials()) return null
  const currentApp = getAdminApp()
  if (!currentApp) return null

  try {
    return getStorage(currentApp).bucket()
  } catch (err) {
    console.error('[firebase] no se pudo obtener el bucket de Storage:', err)
    return null
  }
}
