import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const SIZES = new Set([192, 512]);

/** PNG app icons for the PWA manifest (generated, so there's no binary asset to maintain). */
export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size: raw } = await ctx.params;
  const size = SIZES.has(Number(raw)) ? Number(raw) : 192;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #006633 0%, #004d26 100%)',
        color: 'white',
        fontSize: size * 0.42,
        fontWeight: 800,
        letterSpacing: -size * 0.02,
      }}
    >
      NA
    </div>,
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    }
  );
}
