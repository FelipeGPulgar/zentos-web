'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: '¿Cuánto cuesta desarrollar una web o una app?',
    a: 'Depende del alcance: una landing profesional parte desde montos accesibles, mientras una plataforma a medida o una app móvil requiere más diseño y lógica. Después de una llamada de diagnóstico (gratis) te entregamos una cotización cerrada y desglosada, sin sorpresas.',
  },
  {
    q: '¿En cuánto tiempo entregan un proyecto?',
    a: 'Un sitio o landing suele estar listo en 2 a 4 semanas. Un MVP o una app con funciones personalizadas toma entre 6 y 12 semanas según complejidad. Siempre te damos un cronograma por etapas antes de empezar.',
  },
  {
    q: '¿Trabajan con clientes fuera de Chile?',
    a: 'Sí. Trabajamos de forma remota con clientes en Chile, LATAM y Estados Unidos. La comunicación es por WhatsApp o videollamada, en el huso horario que te quede cómodo.',
  },
  {
    q: '¿Qué pasa después del lanzamiento?',
    a: 'No desaparecemos. Todos los proyectos incluyen soporte post-lanzamiento, corrección de errores y un panel donde ves el avance, envías feedback y pides ajustes. También ofrecemos planes de mantenimiento mensual.',
  },
  {
    q: '¿Cómo empiezo un proyecto con ustedes?',
    a: 'Escríbenos por WhatsApp o desde la página de contacto con una idea breve. En menos de 24 horas te respondemos, agendamos una llamada de diagnóstico y, si hay fit, te enviamos propuesta con alcance, plazos y precio.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-space-800/50">
      {faqs.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-semibold text-white sm:text-base">{item.q}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 ${
                open === i ? 'rotate-180 text-accent-400' : ''
              }`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ${
              open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
