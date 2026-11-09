/** Returns the YouTube video id for watch / youtu.be / shorts / embed / live links, else null. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www|m|music)\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0] || null;
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id =
        u.searchParams.get('v') ??
        u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ??
        null;
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Start time in seconds from a YouTube link's t= / start= parameter (e.g. "3165s", "1h2m3s"). */
export function youTubeStart(url: string): number {
  try {
    const u = new URL(url.trim());
    const t = u.searchParams.get('t') ?? u.searchParams.get('start');
    if (!t) return 0;
    if (/^\d+$/.test(t)) return Number(t);
    const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** True for a YouTube link or a direct http(s) video file link. */
export function isPlayableUrl(url: string): boolean {
  if (!url.trim()) return true; // empty = no video yet
  if (youTubeId(url)) return true;
  try {
    const u = new URL(url.trim());
    return (
      (u.protocol === 'https:' || u.protocol === 'http:') &&
      /\.(mp4|webm|m3u8|mov)$/i.test(u.pathname)
    );
  } catch {
    return false;
  }
}
