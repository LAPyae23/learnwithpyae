import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, jsonError } from '@/lib/auth';
import {
  activeProvider,
  AI_NOT_CONFIGURED,
  aiErrorMessage,
  aiErrorStatus,
  consumeAiQuota,
  generateAiJson,
  refundAiQuota,
} from '@/lib/ai';
import { INTERVIEW_SCENARIOS, INTERVIEW_SCORE_SYSTEM } from '@/lib/prompts';
import { touchStreak } from '@/lib/streak';
import { InterviewScoreSchema } from '@/lib/interviewScore';

export const runtime = 'nodejs';
export const maxDuration = 60;

const requestSchema = z.object({
  scenarioId: z.string(),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1500) }))
    .min(2)
    .max(40),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!activeProvider()) return jsonError(AI_NOT_CONFIGURED, 503);

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid request', 400);
  const scenario = INTERVIEW_SCENARIOS.find((s) => s.id === parsed.data.scenarioId);
  if (!scenario) return jsonError('Scenario not found', 404);
  if (!parsed.data.messages.some((m) => m.role === 'user')) {
    return jsonError('အင်တာဗျူးမှာ အနည်းဆုံး တစ်ခါ ဖြေပေးပါ', 400);
  }

  const quotaError = await consumeAiQuota(session.sub);
  if (quotaError) return jsonError(quotaError, 429);

  const transcript = parsed.data.messages
    .map((m) => `${m.role === 'assistant' ? '面接官' : '候補者'}: ${m.content}`)
    .join('\n\n');

  try {
    const result = await generateAiJson(
      {
        system: INTERVIEW_SCORE_SYSTEM,
        maxTokens: 8000,
        effort: 'medium',
        messages: [
          {
            role: 'user',
            content: `Job: ${scenario.job}
Target level: JLPT ${scenario.level}

Transcript:
${transcript}`,
          },
        ],
      },
      InterviewScoreSchema
    );

    if (!result) {
      return jsonError('အမှတ်ပေးလို့ မရပါ။ ပြန်စမ်းကြည့်ပါ။', 502);
    }
    await touchStreak(session.sub);
    return NextResponse.json({ result });
  } catch (err) {
    console.error('Interview score error', err);
    await refundAiQuota(session.sub).catch(() => {});
    const status = aiErrorStatus(err);
    return jsonError(aiErrorMessage(err), status);
  }
}
