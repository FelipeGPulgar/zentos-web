/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sitio 100% estático para Firebase Hosting (plan Spark, sin servidor).
  output: 'export',

  // Firebase Hosting sirve /ruta/ -> /ruta/index.html
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
