import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Starfield from '@/components/Starfield'
import CookieBanner from '@/components/CookieBanner'
import { siteConfig } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Zentos | Desarrollo de Software, Webs y Apps en Chile',
    template: '%s | Zentos',
  },
  description: siteConfig.description,
  keywords: [
    'desarrollo de software Chile',
    'agencia de software',
    'desarrollo de apps móviles',
    'desarrollo web Chile',
    'empresa de software a medida',
    'MVP desarrollo',
    'agencia digital Chile',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Zentos | Desarrollo de Software, Webs y Apps en Chile',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zentos | Desarrollo de Software, Webs y Apps en Chile',
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Zentos',
  description: siteConfig.description,
  url: siteConfig.url,
  email: siteConfig.email,
  areaServed: 'CL',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CL',
  },
  sameAs: ['https://www.instagram.com/'],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Starfield />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pt-16 lg:pt-20">{children}</main>
          <Footer />
        </div>
        <CookieBanner />
      </body>
    </html>
  )
}
