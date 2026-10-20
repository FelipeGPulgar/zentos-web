'use client'

import { useState, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Search, Upload, X, Loader2, ImageIcon, ExternalLink } from 'lucide-react'

type SearchResult = {
  id: string
  thumb: string
  full: string
  alt: string
  author: string
  sourceUrl: string
}

type Props = {
  value: string
  onValueChange: Dispatch<SetStateAction<string>>
}

export default function ImagePicker({ value, onValueChange }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'search' | 'upload'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const search = async (page = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/image-search?q=${encodeURIComponent(query)}&page=${page}`)
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data.needsKey) {
          setError(data.error)
        } else {
          throw new Error(data.error || 'Error al buscar.')
        }
        return
      }
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al subir.')

      onValueChange(data.url)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setUploading(false)
    }
  }

  const selectUnsplash = async (result: SearchResult) => {
    setUploading(true)
    setError('')
    try {
      const res = await fetch(result.full)
      const blob = await res.blob()
      const file = new File([blob], `${result.id}.jpg`, { type: 'image/jpeg' })
      await upload(file)
    } catch {
      setError('No se pudo descargar la imagen. Prueba con otra.')
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            readOnly
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="input-field"
            placeholder="/blog/imagen-cover.webp (vacío = sin imagen)"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn-secondary shrink-0 !px-4"
        >
          <ImageIcon className="h-4 w-4" />
          {open ? 'Cerrar' : 'Elegir'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onValueChange('')}
            className="btn-secondary shrink-0 !px-3"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Vista previa de portada" className="h-40 w-full object-cover" />
        </div>
      )}

      {open && (
        <div className="mt-3 rounded-xl border border-white/10 bg-space-900/80 p-4">
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTab('search')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'search' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Search className="mr-1 inline h-3.5 w-3.5" />
              Buscar (Unsplash)
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'upload' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="mr-1 inline h-3.5 w-3.5" />
              Subir JPG/PNG
            </button>
          </div>

          {tab === 'search' ? (
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  search()
                }}
                className="mb-4 flex gap-2"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field"
                  placeholder="Ej: artificial intelligence, office, laptop..."
                />
                <button type="submit" disabled={loading} className="btn-primary !px-4 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </button>
              </form>

              {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

              {results.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectUnsplash(r)}
                      disabled={uploading}
                      className="group relative overflow-hidden rounded-lg border border-white/10 transition-all hover:border-accent-500/60 disabled:opacity-60"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.thumb} alt={r.alt} className="h-20 w-full object-cover sm:h-24" />
                      {uploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-space-950/70">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-zinc-600">
                Fotos gratis vía{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  Unsplash <ExternalLink className="h-3 w-3" />
                </a>
                . Al usar una foto se guarda localmente en WebP optimizado.
              </p>
            </div>
          ) : (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) upload(f)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary w-full disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Convirtiendo a WebP...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Seleccionar imagen (JPG, PNG, máx 15 MB)
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-zinc-600">
                Se convierte automáticamente a WebP optimizado (~80% menos peso).
              </p>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
