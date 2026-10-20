/**
 * Migra los posts de content/blog/*.md a Firestore (colección `posts`, id = slug).
 *
 * Uso:
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\service-account.json   (Windows)
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\service-account.json" (PowerShell)
 *   node scripts/firebase-import.mjs [--overwrite]
 *
 * Sin --overwrite, los posts que ya existen en Firestore se conservan.
 * Requiere firebase-admin (ya instalado como dependencia del proyecto).
 */

import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog')
const OVERWRITE = process.argv.includes('--overwrite')

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value)
      } catch {
        // se usa tal cual
      }
    }
    data[key] = value
  }
  return { data, body: match[2] }
}

function initAdmin() {
  if (getApps().length > 0) return

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (serviceAccount) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccount.replace(/\\n/g, '\n'))),
    })
    return
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: applicationDefault() })
    return
  }

  console.error(
    '\n✗ No hay credenciales.\n' +
      '  Define GOOGLE_APPLICATION_CREDENTIALS apuntando a un JSON de service account\n' +
      '  (Firebase console → Project settings → Service accounts → Generate new private key)\n'
  )
  process.exit(1)
}

async function main() {
  initAdmin()
  const db = getFirestore()

  const entries = (await readdir(CONTENT_DIR, { withFileTypes: true })).filter(
    (e) => e.isFile() && e.name.endsWith('.md')
  )

  if (entries.length === 0) {
    console.log('No hay posts en content/blog/ — nada que migrar.')
    return
  }

  let created = 0
  let skipped = 0
  let updated = 0

  for (const entry of entries) {
    const slug = entry.name.replace(/\.md$/, '')
    const raw = await readFile(path.join(CONTENT_DIR, entry.name), 'utf8')
    const { data, body } = parseFrontmatter(raw)

    const record = {
      title: data.title || slug,
      description: data.description || '',
      date: data.date || '2026-01-01',
      category: data.category || 'General',
      tags: (data.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      cover: data.cover || '',
      featured: data.featured === 'true',
      draft: data.draft === 'true',
      content: body.trim(),
      updatedAt: Date.now(),
    }

    const ref = db.collection('posts').doc(slug)
    const existing = await ref.get()

    if (existing.exists && !OVERWRITE) {
      skipped++
      console.log(`  • ${slug}: ya existe, se omite (usa --overwrite para forzar)`)
      continue
    }

    await ref.set(record)
    if (existing.exists) {
      updated++
      console.log(`  • ${slug}: actualizado`)
    } else {
      created++
      console.log(`  ✓ ${slug}: creado`)
    }
  }

  console.log(
    `\nListo: ${created} creados, ${updated} actualizados, ${skipped} omitidos ` +
      `(${entries.length} archivos procesados).`
  )
}

main().catch((err) => {
  console.error('✗ Error durante la migración:', err)
  process.exit(1)
})
