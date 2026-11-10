'use client';
import React from 'react';
import PracticeShell, { type PracticeTab } from '@/components/practice/PracticeShell';
import ToneTrainer from '@/components/practice/ToneTrainer';
import WordQuiz from '@/components/practice/WordQuiz';
import SpeakDrill from '@/components/practice/SpeakDrill';
import WritingCheck from '@/components/practice/WritingCheck';
import { ZH_PHRASES, ZH_TIPS, ZH_WORDS } from '@/data/chinese';

const TABS: PracticeTab[] = [
  { id: 'tones', label: '🎵 Tone ၄ မျိုး', render: () => <ToneTrainer /> },
  {
    id: 'hanzi',
    label: '汉字 HSK 1',
    render: () => <WordQuiz lang="zh" words={ZH_WORDS} storageKey="na_zh_words_v1" />,
  },
  {
    id: 'speak',
    label: '🎤 အသံထွက်',
    render: () => (
      <SpeakDrill lang="zh" items={ZH_PHRASES} tips={ZH_TIPS} storageKey="na_zh_speak_v1" />
    ),
  },
  {
    id: 'write',
    label: '✍️ AI စာစစ်',
    render: () => (
      <WritingCheck
        lang="zh"
        prompts={[
          '自我介绍 — မိတ်ဆက်',
          '我的家 — ကျွန်ုပ်ရဲ့ မိသားစု',
          '我的工作 — အလုပ်',
          '周末 — ပိတ်ရက်',
        ]}
        placeholder="我叫…，我是缅甸人。…"
      />
    ),
  },
];

/** Chinese practice: tones first (the hard part), then HSK 1 characters, speaking, writing. */
export default function ChinesePage() {
  return (
    <PracticeShell
      path="/chinese"
      flag="🇨🇳"
      title="တရုတ် စာ လေ့ကျင့်ရန်"
      subtitle="Tone ၄ မျိုး နားထောင်တတ်အောင် → HSK စာလုံး → အသံထွက် → စာရေး"
      tabs={TABS}
    />
  );
}
