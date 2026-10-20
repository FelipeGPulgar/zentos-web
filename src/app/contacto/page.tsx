import type { Metadata } from 'next'
import { Mail, MessageCircle, MapPin, Clock } from 'lucide-react'
import ContactForm from './ContactForm'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contacto — Cotiza tu proyecto',
  description:
    'Contacta a Zentos para cotizar el desarrollo de tu web, app móvil o software a medida. Respondemos en menos de 24 horas.',
}

export default function ContactoPage() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-site">
        <div className="mb-14 max-w-2xl">
          <p className="section-label mb-3">Contacto</p>
          <h1 className="section-title">Hablemos de tu proyecto</h1>
          <p className="mt-4 text-zinc-400">
            Cuéntanos qué necesitas construir. Te respondemos en menos de 24 horas hábiles con los
            siguientes pasos, sin compromiso.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover flex items-start gap-4 p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                <MessageCircle className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-semibold text-white">WhatsApp</h2>
                <p className="text-sm text-zinc-400">Respuesta rápida, directo con el equipo</p>
              </div>
            </a>

            <a href={`mailto:${siteConfig.email}`} className="card card-hover flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                <Mail className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-semibold text-white">Email</h2>
                <p className="text-sm text-zinc-400">{siteConfig.email}</p>
              </div>
            </a>

            <div className="card flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                <MapPin className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-semibold text-white">Ubicación</h2>
                <p className="text-sm text-zinc-400">Chile · Trabajo remoto con clientes en LATAM y USA</p>
              </div>
            </div>

            <div className="card flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                <Clock className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-semibold text-white">Horario</h2>
                <p className="text-sm text-zinc-400">Lunes a viernes, 9:00 a 19:00 (GMT-4)</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
