import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Tag } from 'lucide-react'
import { getAllPosts, formatDate } from '@/lib/blog'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Blog — IA, desarrollo y negocios digitales',
  description:
    'Guías sobre costos de desarrollo, automatización con IA, MVP, e-commerce y cómo elegir equipo de software en Chile. Contenido práctico de Zentos.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <section className="py-20 lg:py-28">
      <div className="container-site">
        <div className="mb-14 max-w-2xl">
          <p className="section-label mb-3">Blog</p>
          <h1 className="section-title">IA, desarrollo y negocios digitales</h1>
          <p className="mt-4 text-zinc-400">
            Guías prácticas sobre automatización, costos reales de desarrollo, producto digital y
            todo lo que necesitas saber antes de invertir en software.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-zinc-400">Pronto publicaremos nuevos artículos.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`card card-hover group flex flex-col overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                {post.cover && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-space-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-800/60 via-transparent to-transparent" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 font-medium text-accent-300">
                    {post.category}
                  </span>
                  <span>{formatDate(post.date)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingMinutes} min
                  </span>
                </div>
                <h2
                  className={`mb-3 font-semibold text-white group-hover:text-accent-300 ${
                    i === 0 ? 'text-2xl' : 'text-lg'
                  }`}
                >
                  {post.title}
                </h2>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-zinc-400">
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs text-zinc-500"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400">
                  Leer artículo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link href="/contacto" className="btn-primary">
            ¿Un proyecto en mente? Hablemos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  )
}
