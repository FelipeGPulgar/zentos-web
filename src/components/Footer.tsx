import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { siteConfig } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-space-950">
      <div className="container-site py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <Image src="/logo.png" alt="Zentos" width={36} height={36} className="rounded-full" />
              <span className="text-lg font-bold tracking-wide text-white">ZENTOS</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              Agencia de desarrollo de software, webs y apps móviles en Chile. Convertimos ideas en
              productos digitales listos para crecer.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {siteConfig.email}
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Zentos"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Servicios</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li><Link href="/#servicios" className="transition-colors hover:text-white">Desarrollo de software</Link></li>
              <li><Link href="/#servicios" className="transition-colors hover:text-white">Sitios y plataformas web</Link></li>
              <li><Link href="/#servicios" className="transition-colors hover:text-white">Apps móviles</Link></li>
              <li><Link href="/#servicios" className="transition-colors hover:text-white">MVP y productos digitales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Empresa</h4>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li><Link href="/proyectos" className="transition-colors hover:text-white">Proyectos</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-white">Blog</Link></li>
              <li><Link href="/contacto" className="transition-colors hover:text-white">Contacto</Link></li>
              <li><Link href="/privacidad" className="transition-colors hover:text-white">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="transition-colors hover:text-white">Términos y condiciones</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="text-center text-sm text-zinc-600">
            © {new Date().getFullYear()} Zentos. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
