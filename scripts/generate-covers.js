const sharp = require('sharp')
const path = require('path')

const OUTPUT = path.join(__dirname, 'public', 'blog')

const posts = [
  { slug: 'cuanto-cuesta-una-web-o-app-en-chile-2026', colors: ['#1a1033', '#7c3aed', '#a78bfa'] },
  { slug: 'automatizar-procesos-empresa-con-ia', colors: ['#0c1222', '#3b82f6', '#60a5fa'] },
  { slug: 'agentes-de-ia-para-negocios', colors: ['#111827', '#8b5cf6', '#c4b5fd'] },
  { slug: 'shopify-vs-tienda-a-medida', colors: ['#0f172a', '#06b6d4', '#67e8f9'] },
  { slug: 'mvp-validar-idea-en-2-semanas', colors: ['#1e1b4b', '#ec4899', '#f9a8d4'] },
  { slug: 'como-elegir-software-factory-en-chile', colors: ['#0c0a1a', '#f59e0b', '#fcd34d'] },
  { slug: 'nextjs-vs-wordpress-2026', colors: ['#020617', '#10b981', '#6ee7b7'] },
]

function createSVG(colors, label) {
  const [bg, mid, light] = colors
  return `<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="30%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${mid}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="75%" cy="60%" r="50%">
      <stop offset="0%" stop-color="${light}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="50%" cy="80%" r="40%">
      <stop offset="0%" stop-color="${mid}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="${bg}"/>
  <rect width="1600" height="900" fill="url(#g1)"/>
  <rect width="1600" height="900" fill="url(#g2)"/>
  <rect width="1600" height="900" fill="url(#g3)"/>
  <circle cx="200" cy="150" r="2" fill="${light}" opacity="0.8"/>
  <circle cx="500" cy="80" r="1.5" fill="#fff" opacity="0.6"/>
  <circle cx="900" cy="200" r="1" fill="${light}" opacity="0.7"/>
  <circle cx="1300" cy="100" r="2" fill="#fff" opacity="0.5"/>
  <circle cx="1500" cy="300" r="1.5" fill="${light}" opacity="0.6"/>
  <circle cx="100" cy="500" r="1" fill="#fff" opacity="0.4"/>
  <circle cx="700" cy="400" r="1.5" fill="${light}" opacity="0.5"/>
  <circle cx="1100" cy="600" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="1450" cy="750" r="2" fill="${light}" opacity="0.4"/>
  <circle cx="350" cy="800" r="1" fill="#fff" opacity="0.7"/>
  <circle cx="800" cy="750" r="1.5" fill="${light}" opacity="0.5"/>
  <text x="80" y="820" font-family="Arial,sans-serif" font-size="18" fill="${light}" opacity="0.5" font-weight="600" letter-spacing="4">ZENTOS</text>
</svg>`
}

async function main() {
  const fs = require('fs')
  await fs.promises.mkdir(OUTPUT, { recursive: true })

  for (const post of posts) {
    const svg = createSVG(post.colors, post.slug)
    const outputPath = path.join(OUTPUT, `${post.slug}.webp`)

    await sharp(Buffer.from(svg))
      .resize(1600, 900)
      .webp({ quality: 82 })
      .toFile(outputPath)

    const stats = await fs.promises.stat(outputPath)
    console.log(`✓ ${post.slug}.webp (${(stats.size / 1024).toFixed(1)} KB)`)
  }

  console.log('\nListo. Todas las imágenes generadas en public/blog/')
}

main().catch(console.error)
