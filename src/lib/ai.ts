import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { ApiError as GeminiApiError, GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Types } from 'mongoose';
import { z } from 'zod';
import { connectDB } from './db';
import { yangonDay } from './streak';
import { AiUsage } from '@/models/AiUsage';
import { User } from '@/models/User';

/**
 * AI provider layer.
 *
 * - Gemini (default when GEMINI_API_KEY is set): uses the Gemini API free tier, so the site costs nothing to run.
 *   Note: on the free tier Google may use prompts/responses to improve its products.
 * - Claude (when ANTHROPIC_API_KEY is set and AI_PROVIDER=anthropic, or no Gemini key): paid, higher quality.
 */
export type AiProvider = 'gemini' | 'anthropic';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
/** Used automatically when the main free-tier model is rate-limited. */
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';
export const CLAUDE_MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
/** Server-side refusal fallback for Claude: a declined request is retried on Anthropic's recommended model. */
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export const FREE_DAILY_LIMIT = Number(process.env.AI_FREE_DAILY_LIMIT || 5);
export const PAID_DAILY_LIMIT = Number(process.env.AI_PAID_DAILY_LIMIT || 200);

/** True only for a real-looking key (ignores template placeholders like "your-…-here"). */
function realKey(value: string | undefined) {
  const key = value?.trim();
  return !!key && !/your-|here$|^x+$|placeholder/i.test(key);
}

export function activeProvider(): AiProvider | null {
  const hasGemini = realKey(process.env.GEMINI_API_KEY);
  const hasClaude = realKey(process.env.ANTHROPIC_API_KEY);
  if (process.env.AI_PROVIDER === 'anthropic' && hasClaude) return 'anthropic';
  if (hasGemini) return 'gemini';
  if (hasClaude) return 'anthropic';
  return null;
}

let anthropic: Anthropic | null = null;
let gemini: GoogleGenAI | null = null;
const getAnthropic = () => (anthropic ??= new Anthropic());
const getGemini = () => (gemini ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

export const AI_NOT_CONFIGURED =
  'AI ဆရာကို မဖွင့်ရသေးပါ (GEMINI_API_KEY မထည့်ရသေးပါ)။ Admin ကို ဆက်သွယ်ပါ။';

// ---------------------------------------------------------------------------
// Daily allowance
// ---------------------------------------------------------------------------

/**
 * Counts one AI request against the user's daily allowance.
 * Returns null if allowed, or a Burmese error message if the limit is reached.
 */
export async function consumeAiQuota(userId: string): Promise<string | null> {
  await connectDB();
  const user = await User.findById(userId).select('plan role').lean();
  if (!user) return 'အကောင့် မတွေ့ပါ';

  const paid =
    user.role === 'admin' ||
    (user.plan?.type &&
      user.plan.type !== 'free' &&
      (!user.plan.expiresAt || new Date(user.plan.expiresAt) > new Date()));
  const limit = paid ? PAID_DAILY_LIMIT : FREE_DAILY_LIMIT;

  const usage = await AiUsage.findOneAndUpdate(
    { user: new Types.ObjectId(userId), day: yangonDay() },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: 'after' }
  ).lean();

  if ((usage?.count ?? 0) > limit) {
    return paid
      ? `ဒီနေ့အတွက် AI မေးခွန်း ${limit} ခု ပြည့်သွားပါပြီ။ မနက်ဖြန် ပြန်မေးပါ။`
      : `ဒီနေ့အတွက် AI မေးခွန်း ${limit} ခု ပြည့်သွားပါပြီ။ မနက်ဖြန် ပြန်မေးပါ။`;
  }
  return null;
}

/** Gives back one use (e.g. when the AI call failed). */
export async function refundAiQuota(userId: string) {
  await AiUsage.updateOne(
    { user: new Types.ObjectId(userId), day: yangonDay(), count: { $gt: 0 } },
    { $inc: { count: -1 } }
  );
}

export async function remainingAiQuota(userId: string) {
  await connectDB();
  const [user, usage] = await Promise.all([
    User.findById(userId).select('plan role').lean(),
    AiUsage.findOne({ user: new Types.ObjectId(userId), day: yangonDay() }).lean(),
  ]);
  const paid = user?.role === 'admin' || (user?.plan?.type && user.plan.type !== 'free');
  const limit = paid ? PAID_DAILY_LIMIT : FREE_DAILY_LIMIT;
  return { limit, used: usage?.count ?? 0, paid: !!paid };
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface AiRequest {
  /** Stable system prompt (kept byte-identical so providers can cache it). */
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens: number;
  /** How much the model should think before answering. */
  effort?: 'low' | 'medium';
}

const REFUSAL_NOTE = '\n\n(ဒီမေးခွန်းကို ဖြေလို့ မရပါ။ ဂျပန်စာနဲ့ ပတ်သက်တာကို မေးပေးပါ။)';

function geminiConfig(req: AiRequest) {
  return {
    systemInstruction: req.system,
    maxOutputTokens: req.maxTokens,
    thinkingConfig: {
      thinkingLevel: req.effort === 'medium' ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW,
    },
  };
}

const geminiContents = (req: AiRequest) =>
  req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

const isRateLimited = (err: unknown) => err instanceof GeminiApiError && err.status === 429;

/** Runs a Gemini call on the main model, retrying once on the fallback model if rate-limited. */
async function withGeminiFallback<T>(run: (model: string) => Promise<T>): Promise<T> {
  try {
    return await run(GEMINI_MODEL);
  } catch (err) {
    if (isRateLimited(err) && GEMINI_FALLBACK_MODEL !== GEMINI_MODEL)
      return run(GEMINI_FALLBACK_MODEL);
    throw err;
  }
}

/** Yields text chunks from whichever provider is active. */
async function* streamChunks(provider: AiProvider, req: AiRequest): AsyncGenerator<string> {
  if (provider === 'gemini') {
    const stream = await withGeminiFallback((model) =>
      getGemini().models.generateContentStream({
        model,
        contents: geminiContents(req),
        config: geminiConfig(req),
      })
    );
    let finish: string | undefined;
    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
      finish = chunk.candidates?.[0]?.finishReason ?? finish;
    }
    if (finish === 'SAFETY' || finish === 'PROHIBITED_CONTENT') yield REFUSAL_NOTE;
    if (finish === 'MAX_TOKENS') yield ' …';
    return;
  }

  const stream = getAnthropic().beta.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: req.maxTokens,
    output_config: { effort: req.effort ?? 'low' },
    system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
    messages: req.messages,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
  });
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta')
      yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') yield REFUSAL_NOTE;
  if (final.stop_reason === 'max_tokens') yield ' …';
}

/**
 * Streams the AI answer back to the browser as plain UTF-8 text.
 * Errors after streaming has started are appended as a Burmese note instead of breaking the response.
 */
export function streamAiText(req: AiRequest, opts: { refundUserId?: string } = {}) {
  const provider = activeProvider();
  if (!provider) return new Response(AI_NOT_CONFIGURED, { status: 503 });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sentAny = false;
      try {
        for await (const text of streamChunks(provider, req)) {
          sentAny = true;
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error(`${provider} stream error`, err);
        // Don't charge the learner's daily allowance for a request that produced nothing
        if (!sentAny && opts.refundUserId) await refundAiQuota(opts.refundUserId).catch(() => {});
        controller.enqueue(encoder.encode(`\n\n${aiErrorMessage(err)}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}

/** One structured (JSON) answer validated against a Zod schema. Returns null if the model declined. */
export async function generateAiJson<S extends z.ZodType>(
  req: AiRequest,
  schema: S
): Promise<z.infer<S> | null> {
  const provider = activeProvider();
  if (!provider) throw new Error('AI not configured');

  if (provider === 'gemini') {
    const res = await withGeminiFallback((model) =>
      getGemini().models.generateContent({
        model,
        contents: geminiContents(req),
        config: {
          ...geminiConfig(req),
          responseMimeType: 'application/json',
          // Gemini takes plain JSON Schema; drop the $schema dialect marker
          responseJsonSchema: (({ $schema: _s, ...rest }) => rest)(
            z.toJSONSchema(schema) as Record<string, unknown>
          ),
        },
      })
    );
    if (!res.text) return null;
    const parsed = schema.safeParse(JSON.parse(res.text));
    return parsed.success ? parsed.data : null;
  }

  const res = await getAnthropic().beta.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: req.maxTokens,
    betas: [FALLBACK_BETA],
    fallbacks: 'default',
    output_config: { effort: req.effort ?? 'medium', format: betaZodOutputFormat(schema) },
    system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
    messages: req.messages,
  });
  if (res.stop_reason === 'refusal') return null;
  return (res.parsed_output as z.infer<S> | null) ?? null;
}

export function aiErrorMessage(err: unknown) {
  if (err instanceof GeminiApiError) {
    if (err.status === 429) return 'AI ဆရာ အလုပ်များနေပါတယ်။ ခဏနေမှ ပြန်မေးပါ။';
    if (err.status === 400 || err.status === 401 || err.status === 403)
      return 'AI key မှားနေပါတယ်။ Admin ကို ဆက်သွယ်ပါ။';
    return 'AI ဆရာ ခဏ ပြဿနာ ရှိနေပါတယ်။ ပြန်စမ်းကြည့်ပါ။';
  }
  if (err instanceof Anthropic.RateLimitError) return 'AI ဆရာ အလုပ်များနေပါတယ်။ ခဏနေမှ ပြန်မေးပါ။';
  if (err instanceof Anthropic.AuthenticationError)
    return 'AI key မှားနေပါတယ်။ Admin ကို ဆက်သွယ်ပါ။';
  if (err instanceof Anthropic.APIConnectionError)
    return 'AI server ကို ချိတ်ဆက်လို့ မရပါ။ ပြန်စမ်းကြည့်ပါ။';
  if (err instanceof Anthropic.APIError) return 'AI ဆရာ ခဏ ပြဿနာ ရှိနေပါတယ်။ ပြန်စမ်းကြည့်ပါ။';
  return 'တစ်ခုခု မှားသွားပါတယ်။ ပြန်စမ်းကြည့်ပါ။';
}

export function aiErrorStatus(err: unknown) {
  if (err instanceof GeminiApiError && err.status === 429) return 429;
  if (err instanceof Anthropic.RateLimitError) return 429;
  return 502;
}
