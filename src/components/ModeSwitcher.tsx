'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { MODES, type Mode } from './navItems';
import { rememberMode } from './useMode';
import { useCurrentUser } from './useCurrentUser';

/** Switch between student / teacher / admin views (only shows modes the user has). */
export default function ModeSwitcher({
  mode,
  allowed,
  onSwitch,
  compact,
}: {
  mode: Mode;
  allowed: Mode[];
  onSwitch?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const { user } = useCurrentUser();
  if (allowed.length < 2) return null;
  return (
    <div
      className={`grid gap-1 p-1 rounded-xl bg-muted ${allowed.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
    >
      {allowed.map((m) => (
        <button
          key={m}
          onClick={() => {
            rememberMode(m, user?.role);
            onSwitch?.();
            router.push(MODES[m].home);
          }}
          className={`rounded-lg py-1.5 px-1 text-[11.5px] font-semibold transition-colors flex flex-col items-center leading-tight ${
            m === mode
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={m === mode}
        >
          <span className="text-[15px]">{MODES[m].emoji}</span>
          {!compact && <span className="whitespace-nowrap">{MODES[m].label}</span>}
        </button>
      ))}
    </div>
  );
}
