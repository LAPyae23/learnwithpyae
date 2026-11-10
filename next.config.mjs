import { imageHosts } from './image-hosts.config.mjs';

// AI features (AI tutor, interview, "why was I wrong") are shown when an AI key is set, or in demo mode.
// Computed at build time, so add a key on Vercel and redeploy to turn them on.
const realKey = (v) => !!v?.trim() && !/your-|here$|^x+$|placeholder/i.test(v.trim());
const aiEnabled =
  [
    'OPENAI_COMPAT_API_KEY',
    'OPENROUTER_API_KEY',
    'GROQ_API_KEY',
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY',
  ].some((k) => realKey(process.env[k])) || process.env.AI_DEMO !== 'off'; // demo mode (canned answers) when there's no key

const dev = process.env.NODE_ENV !== 'production';

// Content Security Policy: only this site's own scripts, YouTube (nocookie) frames, and images
// over HTTPS. Next.js needs inline scripts/styles; dev mode also needs eval and the HMR websocket.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com',
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The microphone is used by the speaking drills, on this site only
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AI_ENABLED: aiEnabled ? '1' : '',
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
};
export default nextConfig;
