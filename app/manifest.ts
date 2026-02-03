import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MeniKod',
    short_name: 'MeniKod',
    description: 'Sistem za naručivanje hrane putem QR koda u restoranima',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1E3A8A',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['food', 'restaurant', 'business'],
    shortcuts: [
      {
        name: 'Naruči',
        short_name: 'Naruči',
        description: 'Brzo naručivanje',
        url: '/guest',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Admin',
        short_name: 'Admin',
        description: 'Admin panel',
        url: '/admin',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
