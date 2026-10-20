import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import BlogAdmin from './BlogAdmin'

export const metadata: Metadata = {
  title: 'Admin — Blog',
  robots: { index: false, follow: false },
}

export default async function AdminBlogPage() {
  const posts = await getAllPosts({ includeDrafts: true })
  const initialPosts = posts.map(({ html, ...meta }) => meta)

  return <BlogAdmin initialPosts={initialPosts} />
}
