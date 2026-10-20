import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin'
import { getBucket, getStorageBucketName } from '@/lib/firebase/server'

export const runtime = 'nodejs'

const MAX_SIZE = 15 * 1024 * 1024 // 15 MB
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'blog')

export async function POST(request: Request) {
  if (!verifySessionToken(cookies().get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Solicitud inválida.' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No se envió ninguna imagen.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { ok: false, error: 'La imagen supera el máximo de 15 MB.' },
      { status: 400 }
    )
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: 'Formato no soportado. Usa JPG, PNG, WebP o GIF.' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const webp = await sharp(buffer)
      .resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer()

    const bucket = getBucket()

    if (bucket) {
      // Firebase Storage con token de descarga (URL pública permanente)
      const objectPath = `blog/${filename}`
      const token = randomUUID()
      const storageFile = bucket.file(objectPath)

      await storageFile.save(webp, {
        contentType: 'image/webp',
        resumable: false,
      })

      await storageFile.setMetadata({
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token },
      })

      const url =
        `https://firebasestorage.googleapis.com/v0/b/${getStorageBucketName()}` +
        `/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`

      return NextResponse.json({
        ok: true,
        url,
        storage: 'firebase',
        originalSize: file.size,
      })
    }

    // Fallback local (dev sin credenciales de Firebase)
    await mkdir(OUTPUT_DIR, { recursive: true })
    const outputPath = path.join(OUTPUT_DIR, filename)
    await writeFile(outputPath, webp)

    return NextResponse.json({
      ok: true,
      url: `/blog/${filename}`,
      originalSize: file.size,
    })
  } catch (err) {
    console.error('[upload] error al convertir imagen:', err)
    return NextResponse.json(
      { ok: false, error: 'No se pudo procesar la imagen.' },
      { status: 500 }
    )
  }
}
