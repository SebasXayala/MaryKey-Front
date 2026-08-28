import type { NextConfig } from "next";

/**
 * Origen del backend Nest. Se lee solo en el servidor (por eso no lleva el
 * prefijo NEXT_PUBLIC_): el navegador nunca habla directo con él.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Evita que Next infiera la raíz del workspace desde otro lockfile del sistema.
  outputFileTracingRoot: process.cwd(),
  // Escape hatch en Windows: si el antivirus bloquea `.next`, se puede
  // compilar en otra carpeta con `NEXT_DIST_DIR=.next-build npm run build`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Cuando el backend entregue URLs de imágenes (CDN / S3 / etc.),
    // agrega aquí su hostname para poder usarlas con next/image.
    remotePatterns: [
      // { protocol: "https", hostname: "cdn.tu-backend.com" },
    ],
  },

  /**
   * Proxy hacia el backend.
   *
   * El API de Nest todavía no llama a `app.enableCors()`, así que el
   * navegador bloquearía cualquier petición hecha desde otro puerto (el
   * preflight OPTIONS responde 404). Al pasar por este rewrite las llamadas
   * salen desde el servidor de Next, no desde el navegador: para el browser
   * son mismo origen, así que no hay preflight ni CORS.
   *
   * Cuando el backend habilite CORS, esto se puede borrar y apuntar
   * NEXT_PUBLIC_API_URL directo a http://localhost:4000/api/v1.
   */
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
