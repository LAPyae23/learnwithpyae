import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NihongoAcademy — ဂျပန်စာ JLPT',
    short_name: 'NihongoAcademy',
    description: 'မြန်မာလို ရှင်းပြတဲ့ ဂျပန်စာ JLPT သင်တန်း',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8faf9',
    theme_color: '#006633',
    lang: 'my',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
