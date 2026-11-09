/**
 * POSTs JSON and streams the plain-text response, calling onChunk with the full text so far.
 * Throws an Error with the server's (Burmese) message for non-2xx responses.
 */
export async function streamText(
  path: string,
  body: unknown,
  onChunk: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new Error('Internet ချိတ်ဆက်မှု မရှိပါ။ ပြန်စမ်းကြည့်ပါ။');
  }

  if (!res.ok || !res.body) {
    const raw = await res.text().catch(() => '');
    let message = raw;
    try {
      message = JSON.parse(raw).error ?? raw;
    } catch {
      /* plain-text error body */
    }
    throw new Error(message || 'တစ်ခုခု မှားသွားပါတယ်။');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk(text);
  }
  text += decoder.decode();
  onChunk(text);
  return text;
}
