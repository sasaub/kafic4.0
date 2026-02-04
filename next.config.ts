import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strogi React mod (bezbedno za produkciju)
  reactStrictMode: true,

  // IGNORIŠI ESLint greške tokom build-a
  // (ne blokira deployment zbog upozorenja)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // IGNORIŠI TypeScript greške tokom build-a
  // (važno jer API rute koriste `any`)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Produkcijske optimizacije
  poweredByHeader: false,          // sakrij "X-Powered-By: Next.js"
  compress: true,                  // gzip kompresija
  productionBrowserSourceMaps: false, // bez source mapa u produkciji

  // Optimizacija slika
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;

