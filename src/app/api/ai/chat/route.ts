import { z } from 'zod';
import { getSession, jsonError } from '@/lib/auth';
import { activeProvider, AI_NOT_CONFIGURED, consumeAiQuota, streamAiText } from '@/lib/ai';
import { SENSEI_SYSTEM } from '@/lib/prompts';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
});

/** Sensei chat: streams a Burmese explanation for the learner's latest question. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!activeProvider()) return new Response(AI_NOT_CONFIGURED, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('မေးခွန်း ပုံစံ မမှန်ပါ', 400);
  // Keep the most recent turns only, and the conversation must start with the learner
  let messages = parsed.data.messages.slice(-20);
  while (messages.length && messages[0].role !== 'user') messages = messages.slice(1);
  if (messages.at(-1)?.role !== 'user') return jsonError('မေးခွန်း မရှိပါ', 400);

  const quotaError = await consumeAiQuota(session.sub);
  if (quotaError) return jsonError(quotaError, 429);

  await connectDB();
  const user = await User.findById(session.sub).select('targetLevel').lean();

  return streamAiText(
    {
      system: SENSEI_SYSTEM,
      maxTokens: 4000, // phone-sized answers
      effort: 'low',
      messages: [
        // Learner context lives in messages, not the system prompt, so the system prompt stays cacheable
        { role: 'user', content: `(Learner profile: target level ${user?.targetLevel ?? 'N5'}.)` },
        { role: 'assistant', content: 'はい、わかりました。' },
        ...messages,
      ],
    },
    { refundUserId: session.sub }
  );
}
