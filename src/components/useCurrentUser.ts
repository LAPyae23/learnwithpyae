'use client';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { PublicUser } from '@/lib/auth';

// One request per page load, shared by every component that asks for the user.
let pending: Promise<PublicUser | null> | null = null;

function loadUser() {
  if (!pending) {
    pending = api<{ user: PublicUser }>('/api/auth/me')
      .then((r) => r.user)
      .catch((err) => {
        // Session cookie is valid but the account no longer exists (or the token was revoked):
        // clear it and send the person to the login page instead of showing a blank profile.
        if (err instanceof ApiError && err.status === 401) logout();
        return null;
      });
  }
  return pending;
}

export function useCurrentUser() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadUser().then((u) => {
      if (alive) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { user, loading };
}

export async function logout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  pending = null;
  window.location.href = '/login';
}

/** First character of the name, for avatar bubbles. */
export function initial(name?: string | null) {
  return name ? (Array.from(name.trim())[0] ?? '?') : '';
}
