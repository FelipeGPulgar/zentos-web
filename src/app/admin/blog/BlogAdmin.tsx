'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  LogOut,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
} from 'lucide-react'
import ImagePicker from '@/components/ImagePicker'
import { ADMIN_BASE } from '@/lib/admin-client'
import { getAllPosts } from '@/lib/blog'
import { getPendingChanges, clearPendingChanges } from '@/lib/pending-changes'
import { isAdminLoggedIn, adminLogout, removePost, savePost } from '@/lib/firebase/data'

type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  cover: string
  featured: boolean
  draft: boolean
}

type EditorState = {
  mode: 'create' | 'edit'
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string
  cover: string
  featured: boolean
  draft: boolean
  content: string
}

const emptyEditor = (): EditorState => ({
  mode: 'create',
  slug: '',
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'General',
  tags: '',
  cover: '',
  featured: false,
  draft: true,
  content: '',
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export default function BlogAdmin({ initialPosts }: { initialPosts: PostMeta[] }) {
  const [posts, setPosts] = useState<PostMeta[]>(initialPosts)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<Record<string, 'create' | 'update' | 'delete'>>({})
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  // El panel es una página estática: si no hay sesión local, fuera.
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace(`${ADMIN_BASE}/login`)
      return
    }
    setChecking(false)
    setPending(getPendingChanges())
  }, [router])

  const update = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setEditor((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const fetchPosts = async () => {
    const list = await getAllPosts({ includeDrafts: true })
    setPosts(list.map(({ html, ...meta }) => meta))
    setPending(getPendingChanges())
  }

  const startCreate = () => {
    setMessage(null)
    setEditor(emptyEditor())
  }

  const startEdit = async (slug: string) => {
    setMessage(null)
    const post = posts.find((p) => p.slug === slug)
    if (!post) return

    let content = ''
    try {
      const { getPostIncludingDrafts } = await import('@/lib/blog')
      const full = await getPostIncludingDrafts(slug)
      if (full) content = full.content
    } catch {
      // si falla, se edita solo la metadata
    }

    setEditor({
      mode: 'edit',
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      category: post.category,
      tags: post.tags.join(', '),
      cover: post.cover || '',
      featured: post.featured,
      draft: post.draft,
      content,
    })
  }

  const save = async () => {
    if (!editor) return
    setSaving(true)
    setMessage(null)

    const slug = editor.slug || slugify(editor.title)

    try {
      await savePost(
        {
          slug,
          title: editor.title,
          description: editor.description,
          date: editor.date,
          category: editor.category,
          tags: editor.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          cover: editor.cover,
          featured: editor.featured,
          draft: editor.draft,
          content: editor.content,
        },
        editor.mode === 'edit' ? editor.slug : undefined
      )

      setMessage({
        type: 'ok',
        text: 'Guardado en Firestore. Para que el artículo sea público hay que reconstruir el sitio.',
      })
      setEditor(null)
      await fetchPosts()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error de conexión.' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (slug: string) => {
    if (!confirm(`¿Eliminar el artículo "${slug}"? Esta acción no se puede deshacer.`)) return
    setMessage(null)

    try {
      await removePost(slug)
      setMessage({
        type: 'ok',
        text: 'Eliminado de Firestore. La página pública desaparece al reconstruir.',
      })
      await fetchPosts()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error de conexión.' })
    }
  }

  const logout = () => {
    adminLogout()
    router.replace(`${ADMIN_BASE}/login`)
  }

  if (checking) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container-site">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label mb-2">Administración</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Artículos del blog</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={startCreate} className="btn-primary !py-2.5">
              <Plus className="h-4 w-4" />
              Nuevo artículo
            </button>
            <button onClick={logout} className="btn-secondary !py-2.5" aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        {Object.keys(pending).length > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                Hay {Object.keys(pending).length} cambio(s) guardados que aún no son públicos.
              </p>
              <p className="mt-1 text-yellow-200/80">
                Este sitio es estático: ejecuta <code>npm run deploy</code> para regenerar las
                páginas y publicar los cambios.
              </p>
              <button
                onClick={() => {
                  clearPendingChanges()
                  setPending({})
                }}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Ya lo publiqué, limpiar aviso
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            role="alert"
            className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              message.type === 'ok'
                ? 'border-accent-500/30 bg-accent-500/10 text-accent-300'
                : 'border-red-500/30 bg-red-500/10 text-red-300'
            }`}
          >
            {message.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {editor ? (
          <div className="card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editor.mode === 'create' ? 'Nuevo artículo' : `Editando: ${editor.slug}`}
              </h2>
              <button
                onClick={() => setEditor(null)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Cerrar editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-title" className="mb-2 block text-sm font-medium text-zinc-300">
                  Título *
                </label>
                <input
                  id="f-title"
                  value={editor.title}
                  onChange={(e) => {
                    update('title', e.target.value)
                    if (editor.mode === 'create' && !editor.slug) update('slug', slugify(e.target.value))
                  }}
                  className="input-field"
                  placeholder="Título del artículo"
                />
              </div>

              <div>
                <label htmlFor="f-slug" className="mb-2 block text-sm font-medium text-zinc-300">
                  Slug (URL) *
                </label>
                <input
                  id="f-slug"
                  value={editor.slug}
                  onChange={(e) => update('slug', e.target.value.toLowerCase())}
                  className="input-field"
                  placeholder="mi-articulo"
                />
                <p className="mt-1 text-xs text-zinc-600">/blog/{editor.slug || '...'}</p>
              </div>

              <div>
                <label htmlFor="f-date" className="mb-2 block text-sm font-medium text-zinc-300">
                  Fecha *
                </label>
                <input
                  id="f-date"
                  type="date"
                  value={editor.date}
                  onChange={(e) => update('date', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-desc" className="mb-2 block text-sm font-medium text-zinc-300">
                  Descripción (para Google y listados) *
                </label>
                <textarea
                  id="f-desc"
                  rows={2}
                  maxLength={160}
                  value={editor.description}
                  onChange={(e) => update('description', e.target.value)}
                  className="input-field resize-none"
                  placeholder="Resumen de una o dos frases..."
                />
                <p className="mt-1 text-right text-xs text-zinc-600">
                  {editor.description.length} / 160
                </p>
              </div>

              <div>
                <label htmlFor="f-cat" className="mb-2 block text-sm font-medium text-zinc-300">
                  Categoría
                </label>
                <input
                  id="f-cat"
                  value={editor.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="input-field"
                  placeholder="IA, E-commerce, Precios..."
                />
              </div>

              <div>
                <label htmlFor="f-tags" className="mb-2 block text-sm font-medium text-zinc-300">
                  Tags (separados por coma)
                </label>
                <input
                  id="f-tags"
                  value={editor.tags}
                  onChange={(e) => update('tags', e.target.value)}
                  className="input-field"
                  placeholder="ia, automatización, chile"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Imagen de portada (opcional)
                </label>
                <ImagePicker
                  value={editor.cover}
                  onValueChange={(v) => update('cover', typeof v === 'string' ? v : '')}
                />
              </div>

              <div className="flex flex-wrap gap-6 sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={editor.draft}
                    onChange={(e) => update('draft', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-space-900 accent-accent-500"
                  />
                  <EyeOff className="h-4 w-4 text-zinc-500" />
                  Borrador (oculto al público)
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={editor.featured}
                    onChange={(e) => update('featured', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-space-900 accent-accent-500"
                  />
                  <Star className="h-4 w-4 text-zinc-500" />
                  Destacado
                </label>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-content" className="mb-2 block text-sm font-medium text-zinc-300">
                  Contenido (Markdown) *
                </label>
                <textarea
                  id="f-content"
                  rows={18}
                  value={editor.content}
                  onChange={(e) => update('content', e.target.value)}
                  className="input-field resize-y font-mono text-sm"
                  placeholder={'## Subtítulo\n\nPárrafo del artículo...\n\n- lista\n- de puntos'}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar artículo
                  </>
                )}
              </button>
              <button onClick={() => setEditor(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="card p-10 text-center text-zinc-400">
                <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                No hay artículos todavía. Crea el primero.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.slug} className="card flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-white">{post.title}</h2>
                      {post.draft && (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-300">
                          Borrador
                        </span>
                      )}
                      {post.featured && (
                        <span className="flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-[11px] font-medium text-accent-300">
                          <Star className="h-3 w-3" />
                          Destacado
                        </span>
                      )}
                      {pending[post.slug] && (
                        <span className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-300">
                          <RefreshCw className="h-3 w-3" />
                          Sin publicar
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      /blog/{post.slug} · {post.date} · {post.category}
                      {post.tags.length > 0 && ` · ${post.tags.join(', ')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={`Ver /blog/${post.slug}`}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => startEdit(post.slug)}
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={`Editar ${post.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(post.slug)}
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Eliminar ${post.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}
