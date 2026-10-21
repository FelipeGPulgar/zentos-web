import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Admin — Iniciar sesión',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </section>
  )
}
