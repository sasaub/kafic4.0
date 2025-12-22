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
};

export default nextConfig;
