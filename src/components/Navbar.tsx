'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Rocket } from 'lucide-react'
import Image from 'next/image'
import { siteConfig } from '@/lib/site'

const links = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#proceso', label: 'Proceso' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-space-950/80 backdrop-blur-xl">
      <div className="container-site flex h-16 items-center justify-between lg:h-20">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="Zentos" width={36} height={36} className="rounded-full" />
          <span className="text-lg font-bold tracking-wide text-white">ZENTOS</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link href="/contacto" className="btn-primary ml-3 !py-2.5">
            <Rocket className="h-4 w-4" />
            Cotizar proyecto
          </Link>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-white/5 bg-space-950/95 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-2"
              onClick={() => setIsOpen(false)}
            >
              <Rocket className="h-4 w-4" />
              Cotizar proyecto
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
