import { z } from 'zod';
import { getSession, jsonError } from '@/lib/auth';
import { activeProvider, AI_NOT_CONFIGURED, consumeAiQuota, streamAiText } from '@/lib/ai';
import { INTERVIEW_SCENARIOS, INTERVIEW_SYSTEM } from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 120; // free AI models can queue for a while

const schema = z.object({
  scenarioId: z.string(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1500),
      })
    )
    .max(40),
});

/** One interviewer turn of the job-interview roleplay (streamed). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!activeProvider()) return new Response(AI_NOT_CONFIGURED, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid request', 400);
  const scenario = INTERVIEW_SCENARIOS.find((s) => s.id === parsed.data.scenarioId);
  if (!scenario) return jsonError('Scenario not found', 404);

  // The interview counts as one AI use when it starts, not per turn, so a full practice session is affordable on the free plan.
  if (parsed.data.messages.length === 0) {
    const quotaError = await consumeAiQuota(session.sub);
    if (quotaError) return jsonError(quotaError, 429);
  }

  const setup = `Scenario: ${scenario.job}. Candidate's target level: JLPT ${scenario.level}. The candidate is from Myanmar. Start the interview now.`;

  return streamAiText(
    {
      system: INTERVIEW_SYSTEM,
      maxTokens: 2000,
      effort: 'low',
      messages: [
        { role: 'user' as const, content: setup },
        ...parsed.data.messages.slice(-30),
      ].reduce<{ role: 'user' | 'assistant'; content: string }[]>((acc, m) => {
        // The setup line and the candidate's first answer are both "user"; merge consecutive same-role turns
        const last = acc.at(-1);
        if (last && last.role === m.role) last.content += `\n\n${m.content}`;
        else acc.push({ ...m });
        return acc;
      }, []),
    },
    // Only the opening turn counted against the allowance, so only it is refunded on failure
    { refundUserId: parsed.data.messages.length === 0 ? session.sub : undefined }
  );
}
