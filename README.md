# Mary Kay — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + React Query.

---

## Arrancar

```bash
npm install
npm run dev
```

http://localhost:3000

Antes del primer arranque crea un `.env.local` en la raíz del proyecto:

```env
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=/api/backend
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_API_MOCKS=true
NEXT_PUBLIC_SESSION_COOKIE=mk_session
```

Requiere el backend (repo `MaryKey-Back`, **rama `dev`**) corriendo en el
puerto 4000. Si usa otro puerto, cámbialo en `BACKEND_URL` de `.env.local`.

**Credenciales de prueba:** `demo@marykay.com` / `MaryKay2024`
(usuario real de la base de datos, no simulado).

---

## Estado de la conexión con el backend

El backend ya expone autenticación, usuarios, roles y catálogo (categorías y
productos); siguen pendientes tutoriales, newsletter y recuperación de
contraseña. En vez de apagar los mocks de golpe —lo que dejaría media tienda en
404— **cada ruta se decide por separado** en
[`src/lib/api/backend-coverage.ts`](src/lib/api/backend-coverage.ts):

| Zona | Origen | Endpoints |
| --- | --- | --- |
| Login y registro | **Backend real** | `POST /auth/login`, `POST /auth/register` |
| Sesión | **Backend real** | `GET /auth/profile`, `POST /auth/logout` |
| Perfil de la cuenta | **Backend real** | `GET /users/:id`, `GET /roles` |
| Catálogo | **Backend real** | `GET /categories`, `GET /products`, `GET /products/:id` |
| Tutoriales y newsletter | Simulado | pendientes en el API |
| Recuperar contraseña | Simulado | pendiente en el API |

Para conectar un endpoint nuevo basta agregar su prefijo a
`backend-coverage.ts`; los servicios y la UI no cambian.

### Cómo se salva la diferencia de contratos

El modelo del backend y el de la tienda no coinciden. La traducción está
aislada en [`src/services/backend-user.ts`](src/services/backend-user.ts),
[`src/services/backend-catalog.ts`](src/services/backend-catalog.ts) y los
servicios que los usan:

- El backend guarda `name` (un solo campo, máx. 50) y la UI usa
  `firstName` / `lastName`: se unen al registrar y se parten al leer.
- El registro exige `age`, `gender` (`female` | `male`) y `role_id`. Edad y
  género se piden en el formulario; el `role_id` sale de
  `NEXT_PUBLIC_DEFAULT_ROLE_ID` porque `GET /roles` quedó detrás del guard JWT
  y quien se registra todavía no tiene token. Si la variable está vacía, el
  front intenta leer `/roles` (solo funciona si se vuelve público).
- `POST /auth/login` devuelve el token y el usuario, así que la sesión se arma
  de una sola llamada; `me()` revalida con `GET /auth/profile`.
- El registro no devuelve token, así que encadena un login automático.
- El catálogo del backend es un CRUD por id numérico y sin slug, moneda,
  imagen ni filtros. `backend-catalog.ts` deriva el slug del nombre
  (`labial-mate-12`, con el id al final para que la URL sea única), fija la
  moneda en COP y hace en el cliente el filtrado, el orden y la paginación,
  porque `GET /products` no acepta query params.
- Los mensajes del backend vienen en inglés (`"Invalid credentials"`); se
  traducen en [`src/lib/api/api-error.ts`](src/lib/api/api-error.ts), junto con
  los arreglos de `class-validator`, que se reparten por campo del formulario.

### Sin CORS: proxy en Next

El backend no llama a `app.enableCors()`, así que el navegador bloquearía
cualquier llamada directa (el preflight `OPTIONS` responde 404).
`next.config.ts` define un rewrite `/api/backend/*` → `$BACKEND_URL/api/v1/*`:
las peticiones salen desde el servidor de Next y el navegador las ve como mismo
origen. Cuando el backend habilite CORS se borra el rewrite y se pone la URL
absoluta en `NEXT_PUBLIC_API_URL`.

### Pendientes que dependen del backend

- **`role_id` no se guarda.** `UsersService.create()` arma
  `{ ...userData, role }`, pero la relación en la entidad `User` se llama
  `roles`, así que TypeORM ignora la propiedad y el usuario queda con
  `role_id` en `NULL`. El front sí manda el `role_id`; el arreglo es del lado
  del backend (`roles: role` en `create()` y en `update()`).
- **El catálogo está detrás del guard JWT** (`@UseGuards(JwtAuthGuard)` en
  `CategoriesController` y `ProductsController`), pero la vitrina es pública:
  una visitante sin sesión recibe 401. Mientras eso siga así, el front cae al
  catálogo simulado y avisa por consola. Lo correcto es dejar públicos los
  `GET` y proteger solo `POST`/`PATCH`/`DELETE`.
- Ningún endpoint carga la relación `roles`, así que todas las cuentas se
  muestran como "Clienta".
- `GET /products` no acepta filtros, orden ni paginación, y los productos no
  tienen imagen, slug, SKU ni atributos (acabado, tipo de piel…): los filtros
  laterales de la categoría no se pueden armar con datos reales.
- No existe `/auth/refresh`: el token dura 1 h y al vencer se cierra sesión.
- No existe `/auth/forgot-password`: la recuperación sigue simulada.

### Cuando el backend esté completo

1. Pon `NEXT_PUBLIC_API_MOCKS=false` en `.env.local`.
2. Borra `src/lib/api/mock/` y la rama de mocks en `http.ts`.

Nada más cambia: componentes, formularios y pantallas no conocen ninguna URL.

### Convenciones ya soportadas sin tocar código

- Respuesta plana `{...}` **o** envuelta `{ "data": {...} }`.
- Errores `{ "message": "...", "code": "...", "errors": { "email": "..." } }`
  (también acepta `errors.email` como arreglo, `error.message` anidado y el
  `message: [...]` que genera el `ValidationPipe` de Nest).
- `401` → cierra sesión y redirige al login (no hay refresh token que usar).
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
