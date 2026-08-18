import type { NextConfig } from "next";

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
};

export default nextConfig;
