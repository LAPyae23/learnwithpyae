import 'server-only';

export const MAX_SCREENSHOT_BYTES = 1.5 * 1024 * 1024;

/** Checks the real file signature, not just the declared type. */
export function sniffImage(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png';
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString() === 'RIFF' &&
    buf.subarray(8, 12).toString() === 'WEBP'
  )
    return 'image/webp';
  return null;
}

/** Reads and validates an uploaded payment screenshot. Returns an error message or the data. */
export async function readScreenshot(
  file: FormDataEntryValue | null
): Promise<{ error: string; status: number } | { data: Buffer; mime: string; size: number }> {
  if (!(file instanceof File) || file.size === 0) return { error: 'Screenshot တင်ပါ', status: 400 };
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { error: 'ပုံ အရမ်းကြီးနေပါတယ် (1.5MB ထက် မကျော်ရ)', status: 413 };
  }
  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniffImage(data);
  if (!mime) return { error: 'JPG / PNG ပုံပဲ တင်လို့ရပါတယ်', status: 415 };
  return { data, mime, size: data.length };
}
