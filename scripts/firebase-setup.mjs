/**
 * Prepara el proyecto de Firebase `zentos-eeca4` para zentos-web:
 *   1) Reporta el estado de billing (Blaze) del proyecto
 *   2) Habilita las APIs necesarias (Firestore, Storage, Firebase rules)
 *   3) Crea la base de datos Firestore en modo NATIVE (con fallback de regiones)
 *   4) Crea el bucket de Cloud Storage si no existe
 *   5) (con --sa-key) Crea una service account key para uso local de firebase-admin
 *
 * Usa los tokens del CLI de Firebase (requiere `npx firebase-tools login` previo).
 *
 * Uso: node scripts/firebase-setup.mjs [--sa-key]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'zentos-eeca4'
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`
const WANT_SA_KEY = process.argv.includes('--sa-key')

const FIRESTORE_REGIONS = ['southamerica-west1', 'southamerica-east1', 'nam5']

function loadToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json')
  if (!existsSync(configPath)) {
    throw new Error('No hay login de Firebase. Corre: npx firebase-tools login')
  }
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  const token = config.tokens?.access_token
  if (!token) throw new Error('No hay access_token en la config de firebase-tools.')
  return token
}

let token = loadToken()

async function api(url, options = {}) {
  const doFetch = () =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

  let res = await doFetch()

  // Token expirado: pide refresh corriendo un comando del CLI y reintenta
  if (res.status === 401) {
    console.log('  ⏳ Token expirado, refrescando vía CLI...')
    const { execSync } = await import('child_process')
    execSync('npx -y firebase-tools@latest projects:list > nul 2>&1', { shell: 'powershell.exe' })
    token = loadToken()
    res = await doFetch()
  }

  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status, ok: res.ok, body }
}

function fail(msg, detail) {
  console.error(`  ✗ ${msg}`)
  if (detail) console.error('   ', JSON.stringify(detail, null, 2).slice(0, 800))
  throw new Error(msg)
}

// ---------------------------------------------------------------------------
// 1) Billing
// ---------------------------------------------------------------------------
async function checkBilling() {
  console.log('\n[1/4] Verificando billing...')
  const { body } = await api(
    `https://cloudbilling.googleapis.com/v1/projects/${PROJECT_ID}/billingInfo`
  )
  const enabled = body?.billingEnabled
  const account = body?.billingAccountName || '(sin cuenta)'
  console.log(
    `  ${enabled ? '✓ Blaze ACTIVO' : '⚠ Sin Blaze (solo necesario para App Hosting/Functions)'} — cuenta: ${account}`
  )
  return Boolean(enabled)
}

// ---------------------------------------------------------------------------
// 2) APIs
// ---------------------------------------------------------------------------
async function ensureServices() {
  console.log('\n[2/4] Habilitando APIs...')
  const services = [
    'firestore.googleapis.com',
    'storage.googleapis.com',
    'firebaserules.googleapis.com',
    'iam.googleapis.com',
  ]

  for (const service of services) {
    const get = await api(
      `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${service}`
    )
    if (get.ok && get.body?.state === 'ENABLED') {
      console.log(`  ✓ ${service} ya habilitada`)
      continue
    }

    // El nombre del servicio va en la URL: body vacío.
    const enable = await api(
      `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${service}:enable`,
      { method: 'POST', body: JSON.stringify({}) }
    )

    if (enable.ok) {
      console.log(`  ✓ ${service} habilitada`)
    } else {
      console.log(`  ⚠ ${service} (${enable.status})`, JSON.stringify(enable.body).slice(0, 400))
    }
  }
}

// ---------------------------------------------------------------------------
// 3) Firestore
// ---------------------------------------------------------------------------
async function firestoreExists() {
  const res = await api(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)`
  )
  if (res.ok && res.body?.name) return res.body
  if (res.status === 404) return null
  console.log('  ⚠ Error consultando Firestore:', res.status, JSON.stringify(res.body).slice(0, 300))
  return null
}

async function createFirestore() {
  console.log('\n[3/4] Creando base de datos Firestore...')
  const existing = await firestoreExists()
  if (existing) {
    console.log(`  ✓ Ya existe — ubicación: ${existing.locationId}, tipo: ${existing.type}`)
    return
  }

  for (const locationId of FIRESTORE_REGIONS) {
    console.log(`  → Intentando región ${locationId}...`)
    const res = await api(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases?databaseId=(default)`,
      {
        method: 'POST',
        body: JSON.stringify({
          locationId,
          type: 'FIRESTORE_NATIVE',
        }),
      }
    )

    if (res.ok && res.body?.name) {
      // LRO: esperar a que termine
      let op = res.body
      for (let i = 0; i < 60 && !op.done; i++) {
        await new Promise((r) => setTimeout(r, 3000))
        const poll = await api(`https://firestore.googleapis.com/v1/${op.name}`)
        op = poll.body
        process.stdout.write('.')
      }
      console.log('')
      if (op.done && !op.error) {
        console.log(`  ✓ Firestore creado en ${locationId}`)
        return
      }
      console.log('  ⚠ Falló:', JSON.stringify(op.error || op).slice(0, 300))
      continue
    }

    console.log(`  ⚠ ${locationId} no aceptada (${res.status}):`, JSON.stringify(res.body).slice(0, 300))
  }

  fail('No se pudo crear Firestore en ninguna región')
}

// ---------------------------------------------------------------------------
// 4) Bucket de Storage
// ---------------------------------------------------------------------------
async function ensureBucket() {
  console.log('\n[4/4] Verificando bucket de Storage...')
  const get = await api(`https://storage.googleapis.com/storage/v1/b/${BUCKET}`)
  if (get.ok) {
    console.log(`  ✓ Bucket ya existe: ${BUCKET} (${get.body.location})`)
    return
  }

  const create = await api('https://storage.googleapis.com/storage/v1/b?project=' + PROJECT_ID, {
    method: 'POST',
    body: JSON.stringify({ name: BUCKET, location: 'US' }),
  })

  if (create.ok) {
    console.log(`  ✓ Bucket creado: ${BUCKET}`)
  } else {
    console.log(`  ⚠ Error creando bucket (${create.status}):`, JSON.stringify(create.body).slice(0, 500))
    console.log('  → Intentando variante .appspot.com...')
    const alt = `${PROJECT_ID}.appspot.com`
    const create2 = await api('https://storage.googleapis.com/storage/v1/b?project=' + PROJECT_ID, {
      method: 'POST',
      body: JSON.stringify({ name: alt, location: 'US' }),
    })
    if (create2.ok) {
      console.log(`  ✓ Bucket creado: ${alt} — usa FIREBASE_STORAGE_BUCKET=${alt} en .env.local`)
    } else {
      console.log('  ✗ No se pudo crear bucket por API. Hazlo en consola: Storage → Get started')
      console.log('   ', JSON.stringify(create2.body).slice(0, 400))
    }
  }
}

// ---------------------------------------------------------------------------
// 5) Service account key local (--sa-key)
// ---------------------------------------------------------------------------
async function createServiceAccountKey() {
  console.log('\n[extra] Creando service account key para uso local...')
  const outFile = path.join(ROOT, 'firebase-service-account.local.json')
  if (existsSync(outFile)) {
    console.log(`  ✓ Ya existe: ${outFile}`)
    return
  }

  const info = await api(
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts?pageSize=100`
  )
  if (!info.ok) fail('No se pudieron listar service accounts', info.body)

  const accounts = info.body.accounts || []
  console.log('  → Cuentas disponibles:', accounts.map((a) => a.email || a.emailId).join(', ') || '(ninguna)')

  const sa =
    accounts.find((a) => /firebase-adminsdk/i.test(a.email || a.emailId || '')) ||
    accounts.find((a) => (a.email || a.emailId || '').endsWith('-compute@developer.gserviceaccount.com')) ||
    accounts.find((a) => (a.email || a.emailId || '').endsWith('@appspot.com')) ||
    accounts[0]

  if (!sa) {
    console.log('  ⚠ No hay service accounts en el proyecto.')
    return
  }
  const email = sa.email || sa.emailId
  console.log(`  → Usando: ${email}`)

  const key = await api(
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts/${encodeURIComponent(email)}/keys`,
    { method: 'POST', body: JSON.stringify({ privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE' }) }
  )

  if (!key.ok) {
    console.log('  ✗ No se pudo crear la key:', key.status, JSON.stringify(key.body).slice(0, 400))
    return
  }
  return saveKey(key.body, outFile)
}

function saveKey(keyBody, outFile) {
  const jsonB64 = keyBody.privateKeyData
  if (!jsonB64) {
    console.log('  ✗ Respuesta sin privateKeyData')
    return
  }
  const json = Buffer.from(jsonB64, 'base64').toString('utf8')
  writeFileSync(outFile, json, { encoding: 'utf8' })
  console.log(`  ✓ Key guardada en ${outFile} (gitignored)`)
}

// ---------------------------------------------------------------------------
async function main() {
  console.log(`Proyecto: ${PROJECT_ID} · Bucket: ${BUCKET}`)
  await checkBilling()
  await ensureServices()
  await createFirestore()
  await ensureBucket()
  if (WANT_SA_KEY) await createServiceAccountKey()
  console.log('\n✅ Preparación completada.')
}

main().catch((err) => {
  console.error('\n✗', err.message)
  process.exit(1)
})
