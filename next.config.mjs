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

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AI_ENABLED: aiEnabled ? '1' : '',
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
};
export default nextConfig;
