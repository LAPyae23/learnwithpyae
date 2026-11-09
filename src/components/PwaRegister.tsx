'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { flushReviewQueue } from '@/lib/offlineQueue';

/** Registers the service worker, syncs offline flashcard answers, and shows an offline banner. */
export default function PwaRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((e) => console.warn('SW register failed', e));
    }

    const sync = async () => {
      const n = await flushReviewQueue();
      if (n > 0) toast.success(`Offline မှာ ဖြေခဲ့တဲ့ flashcard ${n} ခု သိမ်းပြီးပါပြီ`);
    };
    const goOnline = () => {
      setOffline(false);
      sync();
    };
    const goOffline = () => setOffline(true);

    setOffline(!navigator.onLine);
    if (navigator.onLine) sync();
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-warning text-white text-center text-[12.5px] font-semibold py-1">
      📶 Internet မရှိပါ — Flashcard ဖြေတာတွေကို internet ပြန်ရမှ သိမ်းပေးပါမယ်
    </div>
  );
}
