import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Proyectos y casos de éxito',
  description:
    'Conoce los proyectos de Zentos: apps móviles, plataformas web y sistemas de gestión construidos para empresas y comunidades en Chile.',
}

export default function ProyectosPage() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-site">
        <div className="mb-14 max-w-2xl">
          <p className="section-label mb-3">Portafolio</p>
          <h1 className="section-title">Nuestros proyectos</h1>
          <p className="mt-4 text-zinc-400">
            Casos reales: el problema de negocio, la solución técnica y los resultados. Cada proyecto
            es una página con su historia completa.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/proyectos/${project.slug}`}
              className="card card-hover group overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-space-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-800 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-space-950/80 px-3 py-1 text-xs font-medium text-accent-300 backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
              <div className="p-6">
                <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-accent-300">
                  {project.name}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-zinc-400">{project.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400">
                  Ver caso de éxito
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
