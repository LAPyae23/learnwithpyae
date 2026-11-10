'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ModeSwitcher from './ModeSwitcher';
import { MODES } from './navItems';
import { isActive, useMode } from './useMode';
import { initial, logout } from './useCurrentUser';

type IconName = Parameters<typeof Icon>[0]['name'];

/** Phone tab bar for the current mode, plus a "more" sheet with everything else. */
export default function MobileBottomNav() {
  const { mode, config, allowed, user, current } = useMode();
  const [open, setOpen] = useState(false);

  // Close the sheet after navigating
  useEffect(() => setOpen(false), [current]);

  const tabActive = config.tabs.some((t) => isActive(t.href, current));
  const moreOn = !tabActive || open;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="အဓိက မီနူး"
      >
        <ul className="flex">
          {config.tabs.map((t) => {
            const active = isActive(t.href, current);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-medium ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`px-4 py-0.5 rounded-full ${active ? 'bg-secondary' : ''}`}>
                    <Icon
                      name={t.icon as IconName}
                      size={22}
                      variant={active ? 'solid' : 'outline'}
                    />
                  </span>
                  <span className="leading-tight">{t.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setOpen(true)}
              className={`w-full flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-medium ${
                moreOn ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className={`px-4 py-0.5 rounded-full ${moreOn ? 'bg-secondary' : ''}`}>
                <Icon name="Squares2X2Icon" size={22} variant={moreOn ? 'solid' : 'outline'} />
              </span>
              <span className="leading-tight">နောက်ထပ်</span>
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-label="မီနူး အားလုံး"
        >
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="ပိတ်ရန်"
          />
          <div
            className="absolute bottom-0 inset-x-0 bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
          >
            <div className="sticky top-0 bg-card pt-2 pb-3 px-5 border-b border-border z-10">
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[16px]">
                  {initial(user?.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] truncate">{user?.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {MODES[mode].emoji} {MODES[mode].label}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-muted"
                  aria-label="ပိတ်ရန်"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>
              {allowed.length > 1 && (
                <div className="mt-3">
                  <ModeSwitcher mode={mode} allowed={allowed} onSwitch={() => setOpen(false)} />
                </div>
              )}
            </div>

            <div className="px-4 py-3 space-y-4">
              {config.sections.map((s) => {
                const items = s.items.filter(
                  (i) => !i.roles || (!!user && i.roles.includes(user.role as 'student'))
                );
                if (!items.length) return null;
                return (
                  <div key={s.label}>
                    <p className="text-[12px] font-semibold text-muted-foreground px-1 mb-2">
                      {s.label}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {items.map((i) => {
                        const active = isActive(i.href, current);
                        return (
                          <Link
                            key={i.href}
                            href={i.href}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1 text-center ${
                              active ? 'bg-secondary text-primary' : 'hover:bg-muted'
                            }`}
                          >
                            <span
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                                active ? 'bg-primary text-white' : 'bg-muted text-foreground'
                              }`}
                            >
                              <Icon name={i.icon as IconName} size={22} />
                            </span>
                            <span className="text-[11px] leading-tight line-clamp-2">
                              {i.shortLabel ?? i.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-[13.5px] font-semibold text-danger"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={18} />
                အကောင့်မှ ထွက်ရန်
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
