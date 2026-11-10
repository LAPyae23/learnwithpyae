import { z } from 'zod';
import { getSession, jsonError } from '@/lib/auth';
import { activeProvider, AI_NOT_CONFIGURED, consumeAiQuota, streamAiText } from '@/lib/ai';
import { WRITING_SYSTEM } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 120; // free AI models can queue for a while

const LANG_NAMES = { en: 'English', ko: 'Korean', zh: 'Mandarin Chinese', ja: 'Japanese' } as const;

const schema = z.object({
  lang: z.enum(['en', 'ko', 'zh', 'ja']),
  text: z.string().trim().min(2).max(1500),
});

/** Corrects a learner's short piece of writing and explains the mistakes in Burmese. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!activeProvider()) return new Response(AI_NOT_CONFIGURED, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('စာ ၂ လုံးမှ ၁၅၀၀ လုံးအထိ ရေးပါ', 400);

  const quotaError = await consumeAiQuota(session.sub);
  if (quotaError) return jsonError(quotaError, 429);

  return streamAiText(
    {
      system: WRITING_SYSTEM,
      maxTokens: 3000,
      effort: 'low',
      messages: [
        {
          role: 'user',
          content: `Language: ${LANG_NAMES[parsed.data.lang]}\n\nLearner's text:\n${parsed.data.text}`,
        },
      ],
    },
    { refundUserId: session.sub }
  );
}
