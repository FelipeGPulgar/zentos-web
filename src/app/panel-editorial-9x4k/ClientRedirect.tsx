'use client'

import { useEffect } from 'react'

/** Redirige en el cliente (en export estático no hay redirects de servidor). */
export default function ClientRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])

  return null
}
