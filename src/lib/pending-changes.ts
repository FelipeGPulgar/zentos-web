/**
 * Estado local del panel del admin (sitio estático).
 *
 * Módulo puro de navegador, sin imports de servidor ni de Firestore.
 */

export type PendingChanges = Record<string, 'create' | 'update' | 'delete'>

const CHANGES_KEY = 'zentos:pending-changes'

const isBrowser = typeof window !== 'undefined'

/**
 * En un sitio estático un post nuevo/editado no tiene página pública hasta el
 * siguiente `npm run deploy`. Guardamos ese estado para avisar en el panel.
 */
export function markPendingChange(slug: string, kind: 'create' | 'update' | 'delete'): void {
  if (!isBrowser) return
  try {
    const state = getPendingChanges()
    state[slug] = kind
    window.localStorage.setItem(CHANGES_KEY, JSON.stringify(state))
  } catch {
    // localStorage no disponible: no es crítico
  }
}

export function getPendingChanges(): PendingChanges {
  if (!isBrowser) return {}
  try {
    return JSON.parse(window.localStorage.getItem(CHANGES_KEY) || '{}') as PendingChanges
  } catch {
    return {}
  }
}

export function clearPendingChanges(): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(CHANGES_KEY)
  } catch {
    // ignore
  }
}
