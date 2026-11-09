import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Myanmar, Noto_Sans_JP } from 'next/font/google';
import { Toaster } from 'sonner';
import '../styles/tailwind.css';
import PwaRegister from '@/components/PwaRegister';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const notoMyanmar = Noto_Sans_Myanmar({
  subsets: ['myanmar'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-myanmar',
  display: 'swap',
});

// Japanese glyphs are split into many unicode-range files by Google Fonts,
// so we skip preloading and let the browser fetch only what a page needs.
const notoJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#006633',
};

export const metadata: Metadata = {
  title: 'NihongoAcademy — မြန်မာလို ရှင်းပြတဲ့ ဂျပန်စာ JLPT သင်တန်း',
  description:
    'JLPT N5 မှ N3 အထိ ဂျပန်စာကို မြန်မာလို ရှင်းလင်းချက်၊ flashcard၊ mock test တွေနဲ့ ဖုန်းကနေ လေ့လာပါ။',
  appleWebApp: { capable: true, title: 'NihongoAcademy', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="my"
      className={`${plusJakartaSans.variable} ${notoMyanmar.variable} ${notoJP.variable}`}
    >
      <body>
        <PwaRegister />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
