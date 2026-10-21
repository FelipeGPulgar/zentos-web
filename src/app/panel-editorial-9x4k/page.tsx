import type { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import ClientRedirect from './ClientRedirect'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

/**
 * Entrada del panel: /panel-editorial-9x4k → /panel-editorial-9x4k/login
 *
 * En export estático no hay redirects de servidor: el salto se hace desde el
 * cliente en un componente aparte, para poder declarar `metadata` (noindex).
 */
export default function AdminEntry() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <ClientRedirect to="/panel-editorial-9x4k/login/" />
      <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
    </section>
  )
}
