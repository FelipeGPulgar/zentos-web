import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  robots: { index: false },
}

export default function PrivacidadPage() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-site max-w-3xl">
        <h1 className="section-title mb-10">Política de privacidad</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>
            En Zentos tratamos tus datos personales con responsabilidad. Esta política explica qué
            información recopilamos a través de este sitio y cómo la usamos.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Datos que recopilamos</h2>
          <p>
            Cuando nos contactas mediante el formulario, email o WhatsApp, recibimos los datos que
            nos entregas voluntariamente: nombre, email, teléfono y el contenido de tu mensaje.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Uso de los datos</h2>
          <p>
            Usamos tus datos únicamente para responder tu consulta, preparar una cotización y, si
            lo solicitas, gestionar una relación comercial. No vendemos ni cedemos tus datos a
            terceros.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Conservación</h2>
          <p>
            Conservamos la información solo el tiempo necesario para atender tu solicitud o cumplir
            obligaciones legales. Puedes pedir la eliminación de tus datos escribiéndonos a{' '}
            <a href="mailto:hola@zentos.cl" className="text-accent-400 hover:underline">
              hola@zentos.cl
            </a>
            .
          </p>

          <h2 className="pt-4 text-base font-semibold text-white">Uso de cookies</h2>
          <p>
            Una cookie es un pequeño archivo que se guarda en tu navegador y permite recordar
            información sobre tu visita. Usamos cookies y tecnologías similares para las siguientes
            finalidades:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-zinc-300">Técnicas o necesarias:</strong> imprescindibles
              para que el sitio funcione y para recordar tu decisión sobre cookies. No requieren tu
              consentimiento.
            </li>
            <li>
              <strong className="text-zinc-300">Preferencias:</strong> permiten recordar tus
              ajustes (por ejemplo, idioma o tema) para personalizar tu experiencia.
            </li>
            <li>
              <strong className="text-zinc-300">Analítica:</strong> nos ayudan a medir visitas,
              páginas más vistas y rendimiento del sitio de forma anónima y agregada.
            </li>
            <li>
              <strong className="text-zinc-300">Marketing:</strong> se usan, con tu consentimiento,
              para mostrar contenido o anuncios relevantes y medir campañas.
            </li>
          </ul>
          <p>
            Las cookies no esenciales (preferencias, analítica y marketing) permanecen desactivadas
            hasta que otorgas tu consentimiento expreso mediante el aviso que aparece al ingresar al
            sitio. Puedes aceptarlas todas, rechazar las no esenciales o configurarlas por categoría,
            y cambiar tu decisión en cualquier momento borrando los datos de navegación de este sitio
            o contactándonos.
          </p>

          <h2 className="pt-4 text-base font-semibold text-white">Base legal</h2>
          <p>
            El tratamiento de tus datos y el uso de cookies se realizan conforme a la Ley 19.628
            sobre Protección de la Vida Privada y la Ley 21.719 que moderniza la protección de datos
            personales en Chile. Las cookies no esenciales se tratan sobre la base de tu
            consentimiento, que puedes otorgar, denegar o revocar libremente. También usamos cookies
            técnicas al amparo del interés legítimo de garantizar el funcionamiento y la seguridad
            del sitio.
          </p>

          <h2 className="pt-4 text-base font-semibold text-white">
            Derechos (Ley 19.628 y Ley 21.719)
          </h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y
            portabilidad, así como revocar tu consentimiento, escribiéndonos a{' '}
            <a href="mailto:hola@zentos.cl" className="text-accent-400 hover:underline">
              hola@zentos.cl
            </a>
            . Atenderemos tu solicitud dentro de los plazos que establece la legislación chilena
            vigente.
          </p>
        </div>
      </div>
    </section>
  )
}
