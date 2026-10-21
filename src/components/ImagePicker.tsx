'use client'

import { useState, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Search, Upload, X, Loader2, ImageIcon, ExternalLink, Link2 } from 'lucide-react'
import { getClientStorage } from '@/lib/firebase/client'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

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

const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

export default function ImagePicker({ value, onValueChange }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'search' | 'upload' | 'url'>('search')
  const [query, setQuery] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  /** Busca fotos directamente en la API pública de Unsplash (desde el navegador). */
  const search = async (page = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setError('')

    if (!UNSPLASH_KEY) {
      setError(
        'La búsqueda de Unsplash necesita NEXT_PUBLIC_UNSPLASH_ACCESS_KEY (puedes pegar una URL de imagen mientras tanto).'
      )
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&page=${page}`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      )
      if (!res.ok) throw new Error('Unsplash no respondió. Intenta de nuevo.')
      const data = await res.json()

      setResults(
        (data.results || []).map(
          (r: {
            id: string
            urls: { small: string; regular: string }
            alt_description?: string
            user?: { name?: string }
            links?: { html?: string }
          }) => ({
            id: r.id,
            thumb: r.urls.small,
            full: r.urls.regular,
            alt: r.alt_description || query,
            author: r.user?.name || '',
            sourceUrl: r.links?.html || '',
          })
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  /** Sube a Firebase Storage si hay bucket disponible; si no, guarda la URL de Unsplash. */
  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const storage = getClientStorage()
      if (!storage) throw new Error('Storage no está disponible.')

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const name = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const objectRef = ref(storage, name)
      await uploadBytes(objectRef, file, { contentType: file.type || 'image/jpeg' })
      const url = await getDownloadURL(objectRef)

      onValueChange(url)
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir.'
      setError(
        /storage\/unauthorized|permission|402|403/i.test(message)
          ? 'Storage todavía no está activado en el proyecto Firebase. Usa "Buscar (Unsplash)" o pega una URL mientras tanto.'
          : message
      )
    } finally {
      setUploading(false)
    }
  }

  const selectUnsplash = async (result: SearchResult) => {
    // Sin Storage activo no podemos descargar y re-subir: usamos la URL directa.
    if (!getClientStorage()) {
      onValueChange(result.full)
      setOpen(false)
      return
    }

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
          <div className="mb-4 flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'url' ? 'bg-accent-500/20 text-accent-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link2 className="mr-1 inline h-3.5 w-3.5" />
              Pegar URL
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
                . Se enlazan directo desde su CDN.
              </p>
            </div>
          ) : tab === 'upload' ? (
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
                    Subiendo a Firebase Storage...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Seleccionar imagen (JPG, PNG, máx 15 MB)
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-zinc-600">
                Se sube a Firebase Storage del proyecto. Si Storage aún no está activado, usa
                &laquo;Pegar URL&raquo;.
              </p>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          ) : (
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!urlInput.trim()) return
                  onValueChange(urlInput.trim())
                  setOpen(false)
                }}
                className="flex gap-2"
              >
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="input-field"
                  placeholder="https://.../imagen.jpg"
                />
                <button type="submit" className="btn-primary !px-4">
                  Usar
                </button>
              </form>
              <p className="mt-3 text-xs text-zinc-600">
                Pega el enlace de cualquier imagen (Unsplash, tu CDN, etc.).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
