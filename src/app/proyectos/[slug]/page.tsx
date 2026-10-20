import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, MessageCircle, Rocket } from 'lucide-react'
import { getProject, projects } from '@/lib/projects'
import { siteConfig } from '@/lib/site'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject(params.slug)
  if (!project) return { title: 'Proyecto no encontrado' }
  return {
    title: `${project.name} — ${project.category}`,
    description: project.description,
    openGraph: {
      title: `${project.name} | Caso de éxito de Zentos`,
      description: project.description,
    },
  }
}

export default function ProjectPage({ params }: Props) {
  const project = getProject(params.slug)
  if (!project) notFound()

  return (
    <article className="py-20 lg:py-28">
      <div className="container-site">
        <Link
          href="/proyectos"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a proyectos
        </Link>

        <div className="mb-12 max-w-3xl">
          <span className="mb-4 inline-block rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-300">
            {project.category}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {project.name}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">{project.description}</p>
        </div>

        <div className="card mb-14 overflow-hidden">
          <div className="relative aspect-[16/9] bg-space-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.imageAlt}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">El desafío</h2>
              <p className="leading-relaxed text-zinc-400">{project.challenge}</p>
            </section>
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">La solución</h2>
              <p className="leading-relaxed text-zinc-400">{project.solution}</p>
            </section>
          </div>

          <aside className="card h-fit p-7">
            <h2 className="mb-5 text-base font-semibold text-white">Resultados</h2>
            <ul className="mb-8 space-y-3">
              {project.results.map((result) => (
                <li key={result} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                  {result}
                </li>
              ))}
            </ul>
            <h2 className="mb-4 text-base font-semibold text-white">Stack tecnológico</h2>
            <div className="mb-8 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>
            <Link href="/contacto" className="btn-primary w-full">
              <Rocket className="h-4 w-4" />
              Quiero algo así
            </Link>
          </aside>
        </div>

        <div className="card mt-16 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            ¿Tu negocio tiene un problema similar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Cuéntanos tu caso y te proponemos la mejor solución técnica con plazos y precio cerrados.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary">
              <Rocket className="h-4 w-4" />
              Solicitar cotización
            </Link>
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
