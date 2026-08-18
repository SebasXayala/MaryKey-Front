# Mary Kay — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + React Query.

La aplicación **no es un mockup**: toda la UI consume servicios reales a través
de una única capa HTTP. Mientras el backend no exista, esa capa responde con un
backend simulado en memoria que implementa el mismo contrato. Conectar el API
real es cambiar dos variables de entorno.

---

## Arrancar

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

http://localhost:3000

**Credenciales de prueba (modo sin backend):**
`demo@marykay.com` / `MaryKay2024`

---

## Conectar el backend real

1. En `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=https://api.tu-backend.com/v1
   NEXT_PUBLIC_API_MOCKS=false
   ```

2. Ajusta las rutas en [`src/lib/api/endpoints.ts`](src/lib/api/endpoints.ts)
   para que coincidan con la documentación del API.

3. Ajusta los tipos en [`src/types/`](src/types/) si los nombres de campos
   difieren (`firstName` vs `nombre`, etc.).

4. Borra `src/lib/api/mock/` y la rama de mocks en `http.ts` cuando ya no la
   necesites.

Nada más cambia: componentes, formularios y pantallas no conocen ninguna URL.

### Convenciones ya soportadas sin tocar código

- Respuesta plana `{...}` **o** envuelta `{ "data": {...} }`.
- Errores `{ "message": "...", "code": "...", "errors": { "email": "..." } }`
  (también acepta `errors.email` como arreglo y `error.message` anidado).
- `401` → intenta refrescar con el refresh token una sola vez; si falla, cierra
  sesión y redirige al login.
- Timeout configurable (`NEXT_PUBLIC_API_TIMEOUT`) y errores de red
  normalizados con mensajes en español.

---

## Estructura

```
src/
  app/
    (site)/                 layout con header + footer
      page.tsx              home
      login/                inicio de sesión (diseño principal)
      registro/
      recuperar-password/
      categoria/[slug]/     banner + carrusel de destacados + filtros
      producto/[slug]/      detalle
      tutoriales/           portada editorial, destacado y newsletter
      tutoriales/[slug]/    detalle del tutorial
      buscar/               resultados de búsqueda
      cuenta/               privada (protegida por middleware + RequireAuth)
      carrito/              bolsa de compras
    layout.tsx              fuentes, metadata, providers
    providers.tsx           React Query + Auth + Cart + Wishlist
    error.tsx, not-found.tsx
  components/
    ui/                     design system: Button, Input, Checkbox, Alert, Logo
    layout/                 SiteHeader, SiteFooter
    auth/                   LoginForm, RegisterForm, AuthHero, RequireAuth
    catalog/                ProductCard, FeaturedCarousel, CatalogFilters,
                            CategoryCatalog, CategoryHero, Pagination
    tutorials/              TutorialHero, FeaturedTutorial, TutorialExplorer,
                            TutorialCard, NewsletterCta
  lib/
    api/
      config.ts             variables de entorno
      endpoints.ts          <- único lugar con rutas del backend
      http.ts               <- único lugar que hace fetch
      api-error.ts          normalización de errores
      mock/                 backend simulado (borrable)
    auth/
      auth-context.tsx      sesión, login, logout, refresh
      session-store.ts      persistencia en cookie + localStorage
    cart/                   bolsa de compras
    wishlist/               favoritos
    validation/             esquemas Zod de formularios
  services/                 auth, catalog, tutorials, newsletter
  types/                    contratos del dominio
  middleware.ts             protección de rutas en el servidor
```

### Módulos

| Módulo      | Qué incluye                                                        |
| ----------- | ------------------------------------------------------------------ |
| `auth`      | Login, registro, recuperación, sesión y rutas protegidas            |
| `catalog`   | Categorías con banner, carrusel de destacados, filtros y paginación |
| `cart`      | Bolsa de compras y lista de deseos                                  |
| `tutorials` | Tutoriales, exploración por tema y suscripción al newsletter        |

Regla del proyecto: **la UI llama a `services/`, `services/` llama a `http`,
y solo `http` conoce la red.**

---

## Design system

Los tokens del canvas viven en [`src/app/globals.css`](src/app/globals.css)
(bloque `@theme`). Cambiar un hex ahí lo cambia en toda la app.

| Token       | Valor     |
| ----------- | --------- |
| `primary`   | `#E76AAA` |
| `secondary` | `#8B5E71` |
| `tertiary`  | `#F9F9F9` |
| `neutral`   | `#333333` |

Tipografías: **Playfair Display** (títulos) y **Montserrat** (cuerpo y labels),
cargadas con `next/font`.

Imagen del login: coloca `public/images/auth-hero.jpg`. Si no existe se muestra
el degradado de marca.

---

## Scripts

| Comando             | Descripción                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Servidor de desarrollo             |
| `npm run build`     | Build de producción                |
| `npm run start`     | Servir el build                    |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | TypeScript sin emitir              |

> En Windows, si un antivirus bloquea la carpeta `.next`, compila con
> `set NEXT_DIST_DIR=.next-build && npm run build`.
