import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/panel-editorial-9x4k'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
