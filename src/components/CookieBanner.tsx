'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, Settings, X } from 'lucide-react'

const STORAGE_KEY = 'zentos-cookie-consent'

export type CookiePrefs = {
  necessary: true
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

const CATEGORIES: {
  key: keyof CookiePrefs
  title: string
  description: string
  locked?: boolean
}[] = [
  {
    key: 'necessary',
    title: 'Técnicas o necesarias',
    description:
      'Imprescindibles para que el sitio funcione: seguridad, navegación y recordar tu decisión sobre cookies.',
    locked: true,
  },
  {
    key: 'preferences',
    title: 'Preferencias',
    description:
      'Permiten recordar tus ajustes, como idioma o tema, para ofrecerte una experiencia personalizada.',
  },
  {
    key: 'analytics',
    title: 'Analítica',
    description:
      'Nos ayudan a medir visitas, páginas más vistas y rendimiento de forma anónima y agregada.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description:
      'Se usan para mostrar anuncios relevantes y medir el resultado de nuestras campañas.',
  },
]

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState<CookiePrefs>({
    necessary: true,
    preferences: true,
    analytics: true,
    marketing: true,
  })

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const save = (value: CookiePrefs) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...value, date: new Date().toISOString() })
      )
    } catch {
      // ignore storage errors
    }
    setVisible(false)
    setShowSettings(false)
  }

  const acceptAll = () => save({ necessary: true, preferences: true, analytics: true, marketing: true })
  const rejectNonEssential = () =>
    save({ necessary: true, preferences: false, analytics: false, marketing: false })

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-space-900/95 p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:inset-x-6"
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-white">Aviso de cookies</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300">
            Usamos cookies para que el sitio funcione, recordar tus preferencias, analizar cómo se
            usa y, con tu consentimiento, mostrarte contenido relevante. Las no esenciales solo se
            activan si las aceptas, conforme a la <strong>Ley 19.628</strong> y la{' '}
            <strong>Ley 21.719</strong> de protección de datos de Chile. Más detalles en nuestra{' '}
            <Link href="/privacidad" className="text-accent-400 underline-offset-2 hover:underline">
              Política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>

      {showSettings && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{cat.title}</p>
                <p className="text-xs leading-relaxed text-zinc-400">{cat.description}</p>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={prefs[cat.key]}
                  disabled={cat.locked}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, [cat.key]: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[#7c5cff] disabled:opacity-50"
                  aria-label={`${cat.title}${cat.locked ? ' (siempre activas)' : ''}`}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <Settings className="h-4 w-4" aria-hidden />
          {showSettings ? 'Ocultar preferencias' : 'Configurar'}
        </button>
        <button
          type="button"
          onClick={rejectNonEssential}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Rechazar no esenciales
        </button>
        {showSettings ? (
          <button
            type="button"
            onClick={() => save(prefs)}
            className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Guardar preferencias
          </button>
        ) : (
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Aceptar todas
          </button>
        )}
      </div>
    </div>
  )
}
