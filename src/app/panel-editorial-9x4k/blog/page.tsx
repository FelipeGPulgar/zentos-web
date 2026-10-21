import type { Metadata } from 'next'
import BlogAdmin from './BlogAdmin'

export const metadata: Metadata = {
  title: 'Admin — Blog',
  robots: { index: false, follow: false },
}

// El panel es client-side: la lista real llega desde Firestore en el navegador.
export default function AdminBlogPage() {
  return <BlogAdmin initialPosts={[]} />
}
