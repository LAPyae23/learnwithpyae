'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import TutoringManager from '../../studio/TutoringManager';

/** Teacher: 1-on-1 settings, open times and bookings on their own page. */
export default function TeacherClassesPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-3">
        <div>
          <h1 className="text-[20px] font-bold">📅 1-on-1 class</h1>
          <p className="text-[13px] text-muted-foreground">
            အားတဲ့ အချိန် ဖွင့်ပါ — ကျောင်းသား book ပြီး admin ငွေစစ်ပြီးရင် meeting link ထည့်ပေးပါ
          </p>
        </div>
        <TutoringManager defaultOpen />
      </div>
    </AppLayout>
  );
}
