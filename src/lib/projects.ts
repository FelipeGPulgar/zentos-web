export type Project = {
  slug: string
  name: string
  category: string
  description: string
  image: string
  imageAlt: string
  challenge: string
  solution: string
  results: string[]
  stack: string[]
  liveUrl?: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    slug: 'hay-pan',
    name: 'Hay Pan',
    category: 'App móvil',
    description:
      'App de pedidos y delivery para panaderías y pastelerías, diseñada para que los clientes pidan en segundos y la panadería gestione todo desde un solo lugar.',
    image: '/mockup-haypan.png',
    imageAlt: 'Mockup de Hay Pan, app de pedidos para panaderías',
    challenge:
      'La panadería perdía pedidos por Instagram y WhatsApp: mensajes desordenados, sin control de stock y sin visibilidad del negocio.',
    solution:
      'Diseñamos una app móvil con catálogo visual, carrito, pedidos programados y panel de gestión para la panadería, con notificaciones en tiempo real.',
    results: [
      'Pedidos centralizados en una sola plataforma',
      'Menos errores de registro y mayor rapidez en despacho',
      'Experiencia de compra pensada para clientes recurrentes',
    ],
    stack: ['React Native', 'Node.js', 'PostgreSQL'],
    featured: true,
  },
  {
    slug: 'servicios-construcciones',
    name: 'Servicios Construcciones',
    category: 'Plataforma web',
    description:
      'Plataforma de gestión de proyectos de construcción: avance de obras, documentación y comunicación entre equipos y clientes en tiempo real.',
    image: '/mockup-construcciones.png',
    imageAlt: 'Mockup de plataforma de gestión para Servicios Construcciones',
    challenge:
      'Las obras se gestionaban con hojas de cálculo y cadenas de WhatsApp: información dispersa, sin trazabilidad y difícil de reportar al cliente.',
    solution:
      'Creamos una plataforma web con módulos de proyectos, avance por etapa, uploads de evidencia fotográfica y reportes automáticos para cada cliente.',
    results: [
      'Visibilidad del avance de obra desde cualquier dispositivo',
      'Reportes automáticos que reemplazan planillas manuales',
      'Historial documental ordenado por proyecto',
    ],
    stack: ['Next.js', 'TypeScript', 'AWS'],
    featured: true,
  },
  {
    slug: 'unidos-buscamos',
    name: 'Unidos Buscamos',
    category: 'Plataforma comunitaria',
    description:
      'Plataforma comunitaria que conecta personas que buscan y personas que ofrecen ayuda, con perfiles, búsqueda geolocalizada y publicación de solicitudes.',
    image: '/mockup-unidos.png',
    imageAlt: 'Mockup de Unidos Buscamos, plataforma comunitaria',
    challenge:
      'Una iniciativa comunitaria necesitaba digitalizar su red de apoyo sin presupuesto de empresa grande ni tiempos de desarrollo eternos.',
    solution:
      'Desarrollamos una MVP lista para crecer: registro simple, publicación de necesidades, mapa de solicitudes y panel de moderación, entregada lista para validar tracción.',
    results: [
      'MVP funcional lista para validar con usuarios reales',
      'Arquitectura escalable para futuras funciones',
      'Interfaz simple pensada para todos los públicos',
    ],
    stack: ['Next.js', 'Tailwind CSS', 'PostgreSQL'],
    featured: true,
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
