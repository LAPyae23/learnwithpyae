/** Small fetch wrapper for our own JSON API. Throws ApiError with the server's Burmese message. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('Internet ချိတ်ဆက်မှု မရှိပါ။ ပြန်စမ်းကြည့်ပါ။', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error || 'တစ်ခုခု မှားသွားပါတယ်။ ပြန်စမ်းကြည့်ပါ။', res.status);
  }
  return data as T;
}
