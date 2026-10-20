# Zentos Web — Documentación del Proyecto

## Resumen

Sitio corporativo + blog + panel de administración para **Zentos**, agencia de software en Chile.
Next.js 14 App Router, TypeScript estricto, Tailwind CSS.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (`strict: true`) |
| Estilos | Tailwind CSS 3 |
| Iconos | lucide-react |
| Markdown | marked |
| Imágenes | sharp (conversión WebP) |
| Hosting | AWS Amplify |
| Dominio | nic.cl |

---

## Estructura del proyecto

```
zentos-web/
├── content/blog/           ← Posts del blog (archivos .md)
│   ├── cuanto-cuesta-una-web-o-app-en-chile-2026.md
│   ├── automatizar-procesos-empresa-con-ia.md
│   ├── agentes-de-ia-para-negocios.md
│   ├── shopify-vs-tienda-a-medida.md
│   ├── mvp-validar-idea-en-2-semanas.md
│   ├── como-elegir-software-factory-en-chile.md
│   └── nextjs-vs-wordpress-2026.md
├── public/blog/            ← Imágenes WebP del blog (generadas por admin)
├── data/                   ← Leads del formulario (gitignored)
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Home (hero, servicios, proyectos, blog, FAQ, CTA)
│   │   ├── layout.tsx                  ← Layout raíz (metadata, JSON-LD, Starfield)
│   │   ├── globals.css                 ← Estilos globales + prose-zentos
│   │   ├── robots.ts                   ← Robots.txt
│   │   ├── sitemap.ts                  ← Sitemap dinámico (incluye blog)
│   │   ├── blog/
│   │   │   ├── page.tsx                ← Listado de posts
│   │   │   └── [slug]/page.tsx         ← Artículo individual (SSG + ISR)
│   │   ├── proyectos/
│   │   │   ├── page.tsx                ← Listado de proyectos
│   │   │   └── [slug]/page.tsx         ← Caso de estudio
│   │   ├── contacto/
│   │   │   ├── page.tsx                ← Página de contacto
│   │   │   └── ContactForm.tsx         ← Formulario con API real
│   │   ├── privacidad/page.tsx
│   │   ├── terminos/page.tsx
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx            ← Login (server component, verifica sesión)
│   │   │   │   └── LoginForm.tsx       ← Formulario de login
│   │   │   └── blog/
│   │   │       ├── page.tsx            ← Panel admin (server, verifica sesión)
│   │   │       └── BlogAdmin.tsx       ← Editor CRUD de posts
│   │   └── api/
│   │       ├── contact/route.ts        ← POST /api/contact (formulario)
│   │       └── admin/
│   │           ├── login/route.ts      ← POST login + rate limiting
│   │           ├── logout/route.ts     ← POST logout
│   │           ├── posts/route.ts      ← GET list / POST create
│   │           ├── posts/[slug]/route.ts   ← PUT update / DELETE
│   │           ├── posts/raw/[slug]/route.ts ← GET contenido markdown
│   │           ├── upload/route.ts     ← POST imagen → WebP (sharp)
│   │           └── image-search/route.ts ← GET búsqueda Unsplash
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Faq.tsx
│   │   ├── CookieBanner.tsx
│   │   ├── Starfield.tsx
│   │   └── ImagePicker.tsx             ← Selector de imagen (Unsplash + upload)
│   ├── lib/
│   │   ├── site.ts                     ← Config del sitio (nombre, URL, etc.)
│   │   ├── projects.ts                 ← Datos de proyectos
│   │   ├── blog.ts                     ← Lectura/escritura de posts markdown
│   │   ├── admin.ts                    ← Auth: HMAC sessions, password check
│   │   └── admin-posts.ts              ← Validación de input para admin API
│   └── middleware.ts                   ← Seguridad: path oculto + bloqueo /admin
└── content/blog/                       ← Los .md del blog
```

---

## Seguridad del admin

### Path oculto
- `/admin/*` → **404 real** (no redirect, no existe para el mundo)
- `/api/admin/*` → **404 real**
- Path secreto por defecto: `/panel-editorial-9x4k`
- Configurable via env var `ADMIN_SECRET_PATH`

### Rate limiting login
- 5 intentos fallidos → bloqueo 15 min por IP
- Contador visible al usuario ("te quedan N intentos")

### Sesiones
- Cookie httpOnly + sameSite=lax + secure en producción
- HMAC-SHA256 con `timingSafeEqual`
- Expira en 7 días

### Para cambiar el path secreto
1. Cambiar `ADMIN_SECRET_PATH` en `.env.local` / Amplify env vars
2. Actualizar el matcher en `src/middleware.ts` (última línea)

---

## Formulario de contacto

- **API**: `POST /api/contact`
- **Validación**: nombre, email, mensaje (mín 10 chars)
- **Anti-spam**: honeypot field + rate limiting (5/10min por IP)
- **Notificación**: webhook (`CONTACT_WEBHOOK_URL`) — Discord, Slack, etc.
- **Almacenamiento**: `data/leads.jsonl` (gitignored)
- **Sin webhook configurado**: los leads se guardan igual en el archivo

---

## Blog — Cómo funciona

### Contenido
- Posts como archivos `.md` en `content/blog/`
- Frontmatter: title, description, date, category, tags, cover, featured, draft
- Renderizado con `marked` (GFM)
- Estilos de article: clase `prose-zentos` en `globals.css`

### Páginas públicas
- `/blog` — listado con cards (imagen, categoría, fecha, tags)
- `/blog/[slug]` — artículo individual con JSON-LD, OG tags, CTA, related posts
- ISR con `revalidate = 3600` (1 hora)

### Admin (`/panel-editorial-9x4k/login`)
- CRUD completo: crear, editar, eliminar posts
- Soporte borradores (ocultos al público)
- Editor markdown con preview
- Selector de imagen:
  - **Buscar en Unsplash** (requiere `UNSPLASH_ACCESS_KEY`)
  - **Subir JPG/PNG** → conversión automática a WebP vía sharp
- Cover image en frontmatter, se muestra en listado y artículo

---

## Variables de entorno (`.env.local`)

```bash
# Webhook de notificación del formulario (Discord/Slack/etc.)
CONTACT_WEBHOOK_URL=

# Contraseña del admin del blog
ADMIN_PASSWORD=

# Secreto para firmar sesiones (largo y aleatorio)
ADMIN_SESSION_SECRET=

# Path secreto del admin (cambiar en producción)
ADMIN_SECRET_PATH=

# API key de Unsplash (gratis: unsplash.com/developers)
UNSPLASH_ACCESS_KEY=
```

---

## Consideraciones para Amplify + DynamoDB

### Limitación actual
El filesystem de Amplify es **solo lectura** en producción.
- Los `.md` escritos por el admin **no persisten** después del deploy
- Las imágenes WebP subidas **no persisten** después del deploy

### Solución a corto plazo (gratis)
1. Crear posts desde admin en local
2. Commitear los `.md` a Git
3. Amplify redespliega automáticamente

### Solución a producción (DynamoDB + S3)
- Posts → DynamoDB (ya se usa en zentoscloud)
- Imágenes → S3 (~$0.023/GB, un blog = centavos/mes)
- Mantener el frontmatter como campos DynamoDB

---

## Comandos

```bash
npm run dev        # Desarrollo (localhost:3000)
npm run build      # Build producción
npm run start      # Servir build
npm run lint       # ESLint
```

---

## Estado actual

- [x] Formulario de contacto con API real
- [x] Blog público con 7 posts SEO
- [x] Admin CRUD con auth + rate limiting
- [x] Selector de imagen (Unsplash + upload WebP)
- [x] Path oculto del admin
- [x] SEO completo (sitemap, robots, OG, JSON-LD)
- [x] Navbar + Footer + Home integrados con blog
- [x] Imágenes cover generadas para todos los posts
- [ ] Migrar contenido a DynamoDB (producción)
- [ ] Migrar imágenes a S3 (producción)
- [ ] Configurar webhook real (Discord/Slack)
- [ ] Configurar Unsplash API key

---

## Notas de implementación (importante)

### El admin y el path oculto
El middleware (`src/middleware.ts`) bloquea `/admin/*` con 404 y reescribe
`/panel-editorial-9x4k/*` → `/admin/*`. Detalles clave que NO romper:

1. **Las APIs `/api/admin/*` NO se bloquean en el middleware.** Solo llevan auth
   por cookie (`isAuthorized()` en cada ruta). Si se bloquean, el login no funciona.
2. **Los `redirect()`/`router.push()` deben usar `ADMIN_BASE`** de `src/lib/admin-client.ts`,
   nunca `/admin/...` directo (está bloqueado y da 404).
3. El check de sesión del panel es client-side: si `/api/admin/posts` devuelve
   401, redirige a `${ADMIN_BASE}/login`.

### Imágenes del blog
- Generadas con `scripts/generate-covers.js` (sharp + SVG con gradientes)
- Ejecutar: `node scripts/generate-covers.js`
- Se guardan en `public/blog/*.webp` (~9 KB cada una)
- El admin puede reemplazarlas buscando en Unsplash o subiendo JPG/PNG

### Encoding UTF-8
Los `.md` están en UTF-8. Al editarlos con PowerShell usar `-Encoding UTF8` o
mejor Node (evita corromper acentos).

---

## Deploy en AWS Amplify

### Branch strategy
- `main` → producción (rama que Amplify despliega)
- `dev` → pruebas

### amplify.yml
Crear `amplify.yml` en la raíz (ver archivo incluido). Amplify detecta Next.js
SSR automáticamente.

### Variables de entorno en Amplify
Configurar en **App settings → Environment variables**:
```
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
ADMIN_SECRET_PATH=/panel-editorial-9x4k
NEXT_PUBLIC_ADMIN_SECRET_PATH=/panel-editorial-9x4k
UNSPLASH_ACCESS_KEY=...
CONTACT_WEBHOOK_URL=...
```

### Limitación crítica de Amplify
El filesystem de Amplify es **solo lectura** en producción:
- Posts creados desde admin → NO persisten tras el redeploy
- Imágenes subidas → NO persisten tras el redeploy

**Solución gratis**: crear posts en local, commitear los `.md`, Amplify redespliega.
**Solución completa**: DynamoDB (posts) + S3 (imágenes).

