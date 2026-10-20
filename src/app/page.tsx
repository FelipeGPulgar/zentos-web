import Link from 'next/link'
import {
  Rocket,
  Code2,
  Globe,
  Smartphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Clock,
  Eye,
  Sparkles,
  Calendar,
  PenLine,
} from 'lucide-react'
import Faq from '@/components/Faq'
import { projects } from '@/lib/projects'
import { siteConfig } from '@/lib/site'
import { getLatestPosts, formatDate } from '@/lib/blog'

export const revalidate = 3600

const services = [
  {
    icon: Code2,
    title: 'Desarrollo de software a medida',
    desc: 'Sistemas internos, portales B2B y automatización de procesos con arquitectura escalable y código mantenible. Si tu negocio lo necesita, lo construimos.',
    points: ['Sistemas internos y paneles', 'Integraciones y APIs', 'Migración de sistemas legacy'],
  },
  {
    icon: Globe,
    title: 'Sitios y plataformas web',
    desc: 'Webs corporativas, e-commerce y plataformas con Next.js: rápidas, optimizadas para Google y diseñadas para convertir visitantes en clientes.',
    points: ['Landing pages y corporativos', 'E-commerce y plataformas', 'SEO técnico incluido'],
  },
  {
    icon: Smartphone,
    title: 'Apps móviles',
    desc: 'Aplicaciones nativas e híbridas para iOS y Android, con diseño pensado para el usuario real y panel de administración para tu equipo.',
    points: ['iOS y Android', 'React Native', 'Panel de administración'],
  },
  {
    icon: Layers,
    title: 'MVP y productos digitales',
    desc: '¿Tienes una idea? La convertimos en un MVP funcional listo para validar con usuarios reales y presentar a inversores, con arquitectura preparada para escalar.',
    points: ['Validación rápida', 'Diseño UX/UI', 'Listo para fundraising'],
  },
]

const process = [
  {
    step: '01',
    title: 'Descubrimiento',
    desc: 'Entendemos tu negocio, objetivos y usuarios. Definimos alcance, prioridades y presupuesto antes de escribir una línea de código.',
  },
  {
    step: '02',
    title: 'Diseño',
    desc: 'Wireframes y diseño de interfaz aprobados por ti antes del desarrollo. Ves el producto antes de que exista.',
  },
  {
    step: '03',
    title: 'Desarrollo',
    desc: 'Sprints con entregas continuas. Tienes panel propio para ver el avance, probar demos y enviar feedback en tiempo real.',
  },
  {
    step: '04',
    title: 'Lanzamiento y soporte',
    desc: 'Publicamos, monitoreamos y acompañamos. Corrección de errores y soporte incluido, porque el lanzamiento no es el final.',
  },
]

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Te decimos la verdad',
    desc: 'Te contamos qué se puede hacer, cómo hacerlo bien y qué cuidados necesita tu proyecto antes y después de entregarlo.',
  },
  {
    icon: MessageCircle,
    title: 'Trato directo, sin robots',
    desc: 'Hablas directo con nosotros por WhatsApp desde el día 1. Sin tickets, sin call centers, sin respuestas automáticas.',
  },
  {
    icon: Eye,
    title: 'Panel de seguimiento por proyecto',
    desc: 'Cada cliente tiene su panel para ver el progreso en tiempo real, revisar demos y reportar ajustes con capturas de pantalla.',
  },
  {
    icon: Clock,
    title: 'Entregas con plazos reales',
    desc: 'Cronograma por etapas antes de empezar y demostraciones periódicas. Sabrás siempre en qué va tu proyecto.',
  },
]

export default async function Home() {
  const featured = projects.filter((p) => p.featured)
  const latestPosts = await getLatestPosts(3)

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-site flex min-h-[85vh] flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-xs font-medium text-accent-300">
            <Sparkles className="h-3.5 w-3.5" />
            Agencia de software · Chile
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Desarrollo de software, webs y <span className="text-gradient">apps móviles</span> en Chile
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Transformamos ideas en productos digitales listos para producción: plataformas web,
            aplicaciones móviles, MVPs y sistemas a medida, con panel de seguimiento y acompañamiento
            directo de principio a fin.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary w-full sm:w-auto">
              <Rocket className="h-4 w-4" />
              Cotizar mi proyecto
            </Link>
            <Link href="/proyectos" className="btn-secondary w-full sm:w-auto">
              Ver proyectos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            {['Presupuesto cerrado sin sorpresas', 'Panel de seguimiento incluido', 'Soporte post-lanzamiento'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent-400" />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      <section id="servicios" className="border-t border-white/5 py-24">
        <div className="container-site">
          <div className="mb-14 max-w-2xl">
            <p className="section-label mb-3">Servicios</p>
            <h2 className="section-title">Soluciones digitales de principio a fin</h2>
            <p className="mt-4 text-zinc-400">
              Desde la idea hasta el mantenimiento. Elegimos el stack según tu proyecto, no al revés.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="card card-hover flex flex-col p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10">
                  <service.icon className="h-6 w-6 text-accent-400" />
                </div>
                <h3 className="mb-3 text-base font-semibold text-white">{service.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-zinc-400">{service.desc}</p>
                <ul className="space-y-2 border-t border-white/5 pt-5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs text-zinc-500">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent-400/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proceso" className="border-t border-white/5 bg-space-900/40 py-24">
        <div className="container-site">
          <div className="mb-14 max-w-2xl">
            <p className="section-label mb-3">Proceso</p>
            <h2 className="section-title">Así trabajamos tu proyecto</h2>
            <p className="mt-4 text-zinc-400">
              Un proceso claro y transparente: sabrás siempre qué sigue, cuánto cuesta y cuándo se entrega.
            </p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <li key={item.step} className="card card-hover relative p-7">
                <span className="mb-4 block text-sm font-bold text-accent-400">{item.step}</span>
                <h3 className="mb-3 text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="proyectos" className="border-t border-white/5 py-24">
        <div className="container-site">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="section-label mb-3">Proyectos</p>
              <h2 className="section-title">Trabajos que hablan por nosotros</h2>
              <p className="mt-4 text-zinc-400">
                Cada proyecto resuelve un problema real de negocio. Conoce el caso completo dentro de nuestro sitio.
              </p>
            </div>
            <Link href="/proyectos" className="btn-secondary">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featured.map((project) => (
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
                  <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-accent-300">
                    {project.name}
                  </h3>
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

      <section id="por-que" className="border-t border-white/5 bg-space-900/40 py-24">
        <div className="container-site">
          <div className="mb-14 max-w-2xl">
            <p className="section-label mb-3">Por qué Zentos</p>
            <h2 className="section-title">Una agencia que no desaparece después del pago</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((reason) => (
              <article key={reason.title} className="card card-hover flex gap-5 p-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                  <reason.icon className="h-5 w-5 text-accent-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-white">{reason.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{reason.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 text-center text-lg italic text-zinc-400">
            “Cada proyecto lo tratamos como único, porque lo es.”
          </p>
        </div>
      </section>

      <section id="blog" className="border-t border-white/5 py-24">
        <div className="container-site">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="section-label mb-3">Blog</p>
              <h2 className="section-title">Aprende sobre IA y desarrollo</h2>
              <p className="mt-4 text-zinc-400">
                Guías prácticas sobre automatización, costos reales y todo lo que necesitas saber
                antes de invertir en software.
              </p>
            </div>
            <Link href="/blog" className="btn-secondary">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card card-hover group flex flex-col overflow-hidden"
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
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-0.5 font-medium text-accent-300">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white group-hover:text-accent-300">
                      {post.title}
                    </h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
                      {post.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400">
                      Leer artículo
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card flex items-center gap-4 p-8 text-zinc-400">
              <PenLine className="h-5 w-5 text-accent-400" />
              <p className="text-sm">Pronto publicaremos nuevos artículos en el blog.</p>
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="border-t border-white/5 py-24">
        <div className="container-site">
          <div className="mb-12 text-center">
            <p className="section-label mb-3">Preguntas frecuentes</p>
            <h2 className="section-title">Lo que suelen preguntarnos</h2>
          </div>
          <Faq />
        </div>
      </section>

      <section className="border-t border-white/5 py-24">
        <div className="container-site">
          <div className="card relative overflow-hidden px-8 py-16 text-center">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-accent-500/15 blur-[100px]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ¿Listo para darle vida a tu idea?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                Cuéntanos qué necesitas construir y te respondemos en menos de 24 horas con una
                propuesta clara de alcance, plazos y precio.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/contacto" className="btn-primary w-full sm:w-auto">
                  <Rocket className="h-4 w-4" />
                  Solicitar cotización
                </Link>
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
