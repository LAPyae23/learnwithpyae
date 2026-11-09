/** Client-safe helpers for 1-on-1 class times (always shown in Myanmar time). */
export const fmtMm = (iso: string | Date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Yangon',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

/** "<input type=datetime-local>" value (Myanmar wall-clock time) → ISO string with offset. */
export const mmLocalToIso = (v: string) => `${v}:00+06:30`;

export const BOOKING_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: 'ငွေစစ်ဆေးဆဲ', cls: 'bg-warning-bg text-warning' },
  confirmed: { text: 'အတည်ပြုပြီး', cls: 'bg-success-bg text-success' },
  completed: { text: 'ပြီးဆုံး', cls: 'bg-muted text-muted-foreground' },
  rejected: { text: 'ငြင်းပယ်', cls: 'bg-danger-bg text-danger' },
  cancelled: { text: 'ပယ်ဖျက်', cls: 'bg-muted text-muted-foreground' },
};
