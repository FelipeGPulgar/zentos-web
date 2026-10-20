import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'
import { getAllPosts } from '@/lib/blog'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/proyectos', '/blog', '/contacto', '/privacidad', '/terminos']
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
    changeFrequency: route === '' || route === '/blog' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/proyectos' ? 0.8 : route === '/blog' ? 0.7 : 0.6,
  }))

  const posts = await getAllPosts()
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes]
}
