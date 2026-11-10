import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import LocaleToggle from '@/i18n/LocaleToggle';

export interface LegalSection {
  id?: string;
  heading: string;
  body: string[];
}

/** Shared layout for the Privacy Policy and Terms pages (server-rendered, readable on a phone). */
export default function LegalPage({
  title,
  updated,
  intro,
  sections,
  backLabel,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  backLabel: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-bold text-[15px]">NihongoAcademy</span>
          </Link>
          <LocaleToggle />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-8">
        <Link href="/" className="text-[13px] text-primary font-semibold">
          ← {backLabel}
        </Link>
        <h1 className="text-[26px] font-bold mt-3">{title}</h1>
        <p className="text-[12.5px] text-muted-foreground mt-1">{updated}</p>
        <p className="text-[15px] leading-relaxed mt-5">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.heading} id={s.id} className="mt-7 scroll-mt-6">
            <h2 className="text-[17px] font-bold">
              {i + 1}. {s.heading}
            </h2>
            {s.body.map((p) => (
              <p key={p} className="text-[14.5px] leading-relaxed mt-2 text-foreground/90">
                {p}
              </p>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
