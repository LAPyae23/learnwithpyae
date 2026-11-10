'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useT } from '@/i18n/LocaleProvider';
import LocaleToggle from '@/i18n/LocaleToggle';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tr = useT();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { id: 'nav-courses', label: 'သင်တန်းများ', href: '#courses' },
    { id: 'nav-features', label: 'လုပ်ဆောင်ချက်များ', href: '#features' },
    { id: 'nav-pricing', label: 'ဈေးနှုန်း', href: '#pricing' },
    { id: 'nav-faq', label: 'မေးလေ့ရှိသောမေးခွန်း', href: '#faq' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 sticky-nav ${scrolled ? 'nav-scrolled' : 'bg-transparent'}`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <span
              className={`font-bold text-[17px] tracking-tight ${scrolled ? 'text-foreground' : 'text-white'}`}
            >
              NihongoAcademy
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks?.map((link) => (
              <a
                key={link?.id}
                href={link?.href}
                className={`whitespace-nowrap px-3 xl:px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  scrolled
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tr(link.label)}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LocaleToggle dark={!scrolled} />
            <Link
              href="/login"
              className={`whitespace-nowrap text-[14px] font-semibold px-4 py-2 rounded-lg transition-colors ${
                scrolled
                  ? 'text-primary hover:bg-secondary'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              {tr('အကောင့်ဝင်ရန်')}
            </Link>
            <Link
              href="/login"
              className="whitespace-nowrap bg-white text-primary text-[14px] font-bold px-5 py-2 rounded-lg hover:bg-secondary transition-colors shadow-sm"
            >
              {tr('အခမဲ့ စလေ့လာမယ်')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <LocaleToggle dark={!scrolled} />
            <button
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="မီနူး ဖွင့်/ပိတ်"
            >
              <Icon
                name={mobileOpen ? 'XMarkIcon' : 'Bars3Icon'}
                size={22}
                className={scrolled ? 'text-foreground' : 'text-white'}
              />
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-modal p-4 animate-slide-up">
            <div className="flex flex-col gap-1">
              {navLinks?.map((link) => (
                <a
                  key={link?.id}
                  href={link?.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-[15px] font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {tr(link.label)}
                </a>
              ))}
              <div className="pt-3 border-t border-border mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="text-center px-4 py-2.5 rounded-lg border border-primary text-primary font-semibold text-[14px]"
                >
                  {tr('အကောင့်ဝင်ရန်')}
                </Link>
                <Link
                  href="/login"
                  className="text-center px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-[14px]"
                >
                  {tr('အခမဲ့ စလေ့လာမယ်')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
