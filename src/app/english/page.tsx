'use client';
import React from 'react';
import PracticeShell, { type PracticeTab } from '@/components/practice/PracticeShell';
import MistakesQuiz from '@/components/practice/MistakesQuiz';
import SpeakDrill from '@/components/practice/SpeakDrill';
import WritingCheck from '@/components/practice/WritingCheck';
import { EN_PHRASES, EN_TIPS } from '@/data/english';

const TABS: PracticeTab[] = [
  { id: 'mistakes', label: '❌ မြန်မာတွေ မှားလေ့ရှိတာ', render: () => <MistakesQuiz /> },
  {
    id: 'speak',
    label: '🎤 အသံထွက်',
    render: () => (
      <SpeakDrill lang="en" items={EN_PHRASES} tips={EN_TIPS} storageKey="na_en_speak_v1" />
    ),
  },
  {
    id: 'write',
    label: '✍️ AI စာစစ်',
    render: () => (
      <WritingCheck
        lang="en"
        prompts={[
          'Introduce yourself',
          'Your job or dream job',
          'Why you want to work abroad',
          'A short email to your manager',
        ]}
        placeholder="My name is ... I am from Myanmar. ..."
      />
    ),
  },
];

/** English practice aimed at Burmese speakers' real mistakes, sounds and writing. */
export default function EnglishPage() {
  return (
    <PracticeShell
      path="/english"
      flag="🇬🇧"
      title="English လေ့ကျင့်ရန်"
      subtitle="မြန်မာတွေ အမှားများဆုံး သဒ္ဒါ၊ အသံထွက် (th, v, အဆုံး ဗျည်း) နဲ့ AI စာစစ်"
      tabs={TABS}
    />
  );
}
