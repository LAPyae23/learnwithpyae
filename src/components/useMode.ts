'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MODES, modeOfPath, modesFor, type Mode } from './navItems';
import { useCurrentUser } from './useCurrentUser';

// Remembered per role, so a learner who just became a teacher starts in the teacher mode
const key = (role?: string) => `na_mode:${role ?? 'student'}`;

export function rememberMode(mode: Mode, role?: string) {
  try {
    localStorage.setItem(key(role), mode);
  } catch {
    // private mode
  }
}

export function lastMode(role?: string): Mode | null {
  try {
    return (localStorage.getItem(key(role)) as Mode | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * The active mode: the mode of the current page if it has one, otherwise the last mode used.
 * Falls back to the role's default mode. Also returns the modes the user can switch to.
 */
export function useMode() {
  const { user } = useCurrentUser();
  const pathname = usePathname() ?? '/';
  const search = useSearchParams();
  const allowed = modesFor(user?.role);
  const [stored, setStored] = useState<Mode | null>(null);
  useEffect(() => setStored(lastMode(user?.role)), [pathname, user?.role]);

  const fromPath = modeOfPath(pathname);
  let mode: Mode = fromPath ?? stored ?? allowed[0];
  if (!allowed.includes(mode)) mode = allowed[0];

  // Visiting a teacher/admin/agency page makes it the mode to come back to. Student pages don't:
  // teachers and admins use the switcher to choose the student mode on purpose.
  // Runs only when the page or role changes — not on every render, or it would undo a switch
  // made on this page just before navigating away.
  const role = user?.role;
  useEffect(() => {
    if (role && fromPath && fromPath !== 'student' && modesFor(role).includes(fromPath)) {
      rememberMode(fromPath, role);
    }
  }, [role, fromPath]);

  // Current location as nav hrefs see it (admin tabs live in ?tab=)
  const tab = search?.get('tab');
  const current = pathname === '/admin' ? `/admin?tab=${tab ?? 'overview'}` : pathname;

  return { mode, config: MODES[mode], allowed, user, current };
}

/** Is `href` the active item for the current location? */
export function isActive(href: string, current: string) {
  if (href === current) return true;
  const base = href.split('?')[0];
  // Nested pages (e.g. /lesson/abc highlights /lesson), but not / home pages
  return (
    !href.includes('?') &&
    base !== '/dashboard' &&
    base !== '/teacher' &&
    current.startsWith(`${base}/`)
  );
}
