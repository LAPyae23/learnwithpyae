/** True when an AI key was set at build time (see next.config.mjs). Safe in client, server and edge code. */
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === '1';
