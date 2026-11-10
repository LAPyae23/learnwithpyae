import { LocaleProvider } from '@/i18n/LocaleProvider';
import { getLocale } from '@/i18n/server';
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

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  return {
    title: en
      ? 'NihongoAcademy — Japanese, Chinese, Korean & English, explained in Burmese'
      : 'NihongoAcademy — မြန်မာလို ရှင်းပြတဲ့ ဂျပန်၊ တရုတ်၊ ကိုရီးယား၊ English သင်တန်း',
    description: en
      ? 'Video lessons, flashcards, mock tests, study groups and 1-on-1 classes — learn languages on your phone, explained in Burmese.'
      : 'ဂျပန်၊ တရုတ်၊ ကိုရီးယား၊ English ကို video သင်ခန်းစာ၊ flashcard၊ mock test၊ စာလုပ်ဖော် အုပ်စုနဲ့ ဆရာ/ဆရာမတွေနဲ့ ဖုန်းကနေ မြန်မာလို လေ့လာပါ။',
    appleWebApp: { capable: true, title: 'NihongoAcademy', statusBarStyle: 'default' },
    icons: {
      icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${notoMyanmar.variable} ${notoJP.variable}`}
    >
      <body>
        <PwaRegister />
        <LocaleProvider initial={locale}>{children}</LocaleProvider>
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
