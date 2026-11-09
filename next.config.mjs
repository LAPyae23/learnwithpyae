import { imageHosts } from './image-hosts.config.mjs';

// AI features (AI tutor, interview, "why was I wrong") are shown only when a real AI key is set.
// Computed at build time, so add a key on Vercel and redeploy to turn them on.
const realKey = (v) => !!v?.trim() && !/your-|here$|^x+$|placeholder/i.test(v.trim());
const aiEnabled = realKey(process.env.GEMINI_API_KEY) || realKey(process.env.ANTHROPIC_API_KEY);

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
