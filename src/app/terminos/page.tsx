import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  robots: { index: false },
}

export default function TerminosPage() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-site max-w-3xl">
        <h1 className="section-title mb-10">Términos y condiciones</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>
            Al usar este sitio web de Zentos aceptas los siguientes términos. Si no estás de
            acuerdo, te pedimos no utilizar el sitio.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Uso del sitio</h2>
          <p>
            El contenido de este sitio es informativo sobre nuestros servicios de desarrollo de
            software, webs y aplicaciones. No constituye una oferta vinculante: cada proyecto se
            rige por una propuesta y contrato específicos.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Propiedad intelectual</h2>
          <p>
            Los textos, diseños, marcas y materiales de este sitio son propiedad de Zentos o se usan
            con autorización. Queda prohibida su reproducción sin consentimiento previo.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Responsabilidad</h2>
          <p>
            Nos esforzamos por mantener la información actualizada y el sitio disponible, pero no
            garantizamos ausencia total de errores o interrupciones. Los enlaces a sitios de terceros
            son de su exclusiva responsabilidad.
          </p>
          <h2 className="pt-4 text-base font-semibold text-white">Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia
            se someterá a los tribunales competentes de Santiago.
          </p>
        </div>
      </div>
    </section>
  )
}
