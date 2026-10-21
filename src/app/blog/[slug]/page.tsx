import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, MessageCircle } from 'lucide-react'
import { getAllPosts, getPost, formatDate } from '@/lib/blog'
import { siteConfig } from '@/lib/site'

export const dynamic = 'force-static'

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const url = `${siteConfig.url}/blog/${post.slug}`

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'es_CL',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const all = await getAllPosts()
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: 'es-CL',
    author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    keywords: post.tags.join(', '),
    url: `${siteConfig.url}/blog/${post.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-20 lg:py-28">
        <div className="container-site">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Todos los artículos
            </Link>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 font-medium text-accent-300">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readingMinutes} min de lectura
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">{post.description}</p>

            {post.cover && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full object-cover"
                />
              </div>
            )}

            <div
              className="prose-zentos mt-12"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-white/5 pt-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="card mt-10 p-8 text-center">
              <h2 className="mb-3 text-xl font-semibold text-white">
                ¿Te sirvió este artículo?
              </h2>
              <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-zinc-400">
                Si tienes un proyecto o duda concreta, escríbenos y te respondemos en menos de 24
                horas, sin compromiso.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contacto" className="btn-primary w-full sm:w-auto">
                  Contactar con Zentos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-14 border-t border-white/5 pt-10">
                <h2 className="mb-6 text-lg font-semibold text-white">Sigue leyendo</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="card card-hover group flex flex-col p-6"
                    >
                      <span className="mb-3 text-xs font-medium text-accent-400">{p.category}</span>
                      <h3 className="mb-2 text-sm font-semibold text-white group-hover:text-accent-300">
                        {p.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-zinc-500">{p.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  )
}
