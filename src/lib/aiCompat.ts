import 'server-only';
import { z } from 'zod';

/**
 * OpenAI-compatible chat API (OpenRouter, Groq, and others). No SDK — plain fetch + SSE.
 *
 *   OPENROUTER_API_KEY=…            → https://openrouter.ai/api/v1, model "openrouter/free"
 *   GROQ_API_KEY=…                  → https://api.groq.com/openai/v1, model "llama-3.3-70b-versatile"
 *   OPENAI_COMPAT_API_KEY / _BASE_URL / _MODEL to use any other compatible service.
 */
export class CompatApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

interface CompatConfig {
  key: string;
  baseUrl: string;
  model: string;
  name: string;
}

export function compatConfig(realKey: (v?: string) => boolean): CompatConfig | null {
  const env = process.env;
  if (realKey(env.OPENAI_COMPAT_API_KEY)) {
    return {
      key: env.OPENAI_COMPAT_API_KEY!.trim(),
      baseUrl: env.OPENAI_COMPAT_BASE_URL || 'https://openrouter.ai/api/v1',
      model: env.OPENAI_COMPAT_MODEL || 'openrouter/free',
      name: 'openai-compatible',
    };
  }
  if (realKey(env.OPENROUTER_API_KEY)) {
    return {
      key: env.OPENROUTER_API_KEY!.trim(),
      baseUrl: 'https://openrouter.ai/api/v1',
      model: env.OPENROUTER_MODEL || 'openrouter/free',
      name: 'openrouter',
    };
  }
  if (realKey(env.GROQ_API_KEY)) {
    return {
      key: env.GROQ_API_KEY!.trim(),
      baseUrl: 'https://api.groq.com/openai/v1',
      model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      name: 'groq',
    };
  }
  return null;
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

async function post(cfg: CompatConfig, body: Record<string, unknown>) {
  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        // OpenRouter uses these to show the app in its dashboard (optional elsewhere)
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://learnwithpyae.vercel.app',
        'X-Title': 'NihongoAcademy',
      },
      body: JSON.stringify({ model: cfg.model, ...body }),
    });
  } catch (e) {
    throw new CompatApiError(0, `connection failed: ${(e as Error).message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new CompatApiError(res.status, text.slice(0, 300));
  }
  return res;
}

/** Streams text chunks. */
export async function* compatStream(
  cfg: CompatConfig,
  messages: Msg[],
  maxTokens: number
): AsyncGenerator<string> {
  const res = await post(cfg, { messages, max_tokens: maxTokens, stream: true });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let finish: string | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue; // SSE comments like ": OPENROUTER PROCESSING"
      const data = line.slice(5).trim();
      if (data === '[DONE]') {
        if (finish === 'length') yield ' …';
        return;
      }
      try {
        const json = JSON.parse(data);
        if (json.error) throw new CompatApiError(502, JSON.stringify(json.error).slice(0, 300));
        const choice = json.choices?.[0];
        const text = choice?.delta?.content;
        if (text) yield text;
        if (choice?.finish_reason) finish = choice.finish_reason;
      } catch (e) {
        if (e instanceof CompatApiError) throw e;
        // ignore partial / non-JSON lines
      }
    }
  }
  if (finish === 'length') yield ' …';
}

/** One JSON answer validated with Zod. The schema is described in the system prompt. */
export async function compatJson<S extends z.ZodType>(
  cfg: CompatConfig,
  messages: Msg[],
  maxTokens: number,
  schema: S
): Promise<z.infer<S> | null> {
  const jsonSchema = (({ $schema: _s, ...rest }) => rest)(
    z.toJSONSchema(schema) as Record<string, unknown>
  );
  const withSchema: Msg[] = [
    {
      role: 'system',
      content: `${messages[0]?.role === 'system' ? messages[0].content : ''}\n\nReply with ONLY a JSON object (no markdown, no prose) that matches this JSON Schema:\n${JSON.stringify(jsonSchema)}`,
    },
    ...messages.filter((m) => m.role !== 'system'),
  ];
  const res = await post(cfg, {
    messages: withSchema,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });
  const json = await res.json();
  const raw: string = json.choices?.[0]?.message?.content ?? '';
  const text = raw
    .replace(/^[\s\S]*?```(?:json)?\s*/i, (m) => (m.includes('```') ? '' : m))
    .replace(/```[\s\S]*$/, '')
    .trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
