import { z } from 'zod';
import { getSession, jsonError } from '@/lib/auth';
import { activeProvider, AI_NOT_CONFIGURED, consumeAiQuota, streamAiText } from '@/lib/ai';
import { EXPLAIN_SYSTEM } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  question: z.string().max(1000),
  context: z.string().max(3000).optional(),
  options: z.array(z.string().max(300)).min(2).max(6),
  correctIndex: z.number().int().min(0).max(5),
  selectedIndex: z.number().int().min(0).max(5).nullable(),
  explanation: z.string().max(1000).optional(),
});

const letter = (i: number) => String.fromCharCode(65 + i);

/** Explains why the learner's mock-test answer was wrong, in Burmese. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!activeProvider()) return new Response(AI_NOT_CONFIGURED, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid question', 400);
  const q = parsed.data;
  if (q.correctIndex >= q.options.length) return jsonError('Invalid question', 400);

  const quotaError = await consumeAiQuota(session.sub);
  if (quotaError) return jsonError(quotaError, 429);

  const prompt = [
    `Level: JLPT ${q.level}`,
    q.context ? `Passage / audio script:\n${q.context}` : null,
    `Question: ${q.question}`,
    `Options:\n${q.options.map((o, i) => `${letter(i)}. ${o}`).join('\n')}`,
    `Correct answer: ${letter(q.correctIndex)}. ${q.options[q.correctIndex]}`,
    q.selectedIndex === null
      ? 'The learner skipped this question.'
      : `Learner chose: ${letter(q.selectedIndex)}. ${q.options[q.selectedIndex] ?? ''}`,
    q.explanation ? `Short official explanation (for reference): ${q.explanation}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  return streamAiText(
    {
      system: EXPLAIN_SYSTEM,
      maxTokens: 3000,
      effort: 'low',
      messages: [{ role: 'user', content: prompt }],
    },
    { refundUserId: session.sub }
  );
}
