'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', company: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No pudimos enviar tu mensaje. Intenta de nuevo.')
      }
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Error de conexión. Escríbenos por WhatsApp.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/15">
          <CheckCircle2 className="h-8 w-8 text-accent-400" />
        </div>
        <h2 className="mb-3 text-xl font-semibold text-white">¡Mensaje recibido!</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">
          Te respondemos en menos de 24 horas hábiles a{' '}
          <span className="text-white">{form.email}</span>. Si es urgente, escríbenos por{' '}
          <a
            href={siteConfig.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-400 hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">
            Nombre *
          </label>
          <input
            id="name"
            required
            maxLength={100}
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input-field"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="input-field"
            placeholder="tu@empresa.cl"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-300">
            Teléfono / WhatsApp
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="input-field"
            placeholder="+56 9 ..."
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-300">
            ¿Qué necesitas construir? *
          </label>
          <textarea
            id="message"
            required
            rows={5}
            maxLength={1200}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="input-field resize-none"
            placeholder="Cuéntanos de tu idea o problema de negocio: web, app, sistema interno, MVP..."
          />
          <p className="mt-1 text-right text-xs text-zinc-600">{form.message.length} / 1200</p>
        </div>
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="company">Empresa</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </div>
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'sending' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar mensaje
          </>
        )}
      </button>
      <p className="mt-4 text-xs text-zinc-500">
        Al enviar aceptas nuestra{' '}
        <a href="/privacidad" className="text-zinc-400 hover:text-white">
          política de privacidad
        </a>
        .
      </p>
    </form>
  )
}
