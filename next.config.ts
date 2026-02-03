import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Smanji upozorenja o preload resursima
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Optimizuj CSS učitavanje
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Produkcijske optimizacije
  poweredByHeader: false, // Sakrij "X-Powered-By: Next.js" header
  compress: true, // Omogući gzip kompresiju
  productionBrowserSourceMaps: false, // Ne generiši source maps u produkciji
  // Optimizuj slike
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
