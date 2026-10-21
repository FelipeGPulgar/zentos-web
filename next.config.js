/** @type {import('next').NextConfig} */
const adminPath = process.env.ADMIN_SECRET_PATH || '/panel-editorial-9x4k'

const nextConfig = {
  // Sitio 100% estático para Firebase Hosting (plan Spark, sin servidor).
  output: 'export',

  // Firebase Hosting sirve /ruta -> /ruta.html
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  // Con output: 'export' no hay middleware ni rewrites: el path secreto apunta
  // a una página real y /admin/* se bloquea desde firebase.json.
  async redirects() {
    return [{ source: adminPath, destination: `${adminPath}/login`, permanent: false }]
  },
}

module.exports = nextConfig
