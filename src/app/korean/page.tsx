'use client';
import React from 'react';
import PracticeShell, { type PracticeTab } from '@/components/practice/PracticeShell';
import HangulTrainer from '@/components/practice/HangulTrainer';
import WordQuiz from '@/components/practice/WordQuiz';
import SpeakDrill from '@/components/practice/SpeakDrill';
import WritingCheck from '@/components/practice/WritingCheck';
import { KO_PHRASES, KO_TIPS, KO_WORDS } from '@/data/korean';

const TABS: PracticeTab[] = [
  { id: 'hangul', label: '한글 ဟန်ဂူလ်', render: () => <HangulTrainer /> },
  {
    id: 'words',
    label: '📚 TOPIK စာလုံး',
    render: () => <WordQuiz lang="ko" words={KO_WORDS} storageKey="na_ko_words_v1" />,
  },
  {
    id: 'speak',
    label: '🎤 အသံထွက်',
    render: () => (
      <SpeakDrill lang="ko" items={KO_PHRASES} tips={KO_TIPS} storageKey="na_ko_speak_v1" />
    ),
  },
  {
    id: 'write',
    label: '✍️ AI စာစစ်',
    render: () => (
      <WritingCheck
        lang="ko"
        prompts={[
          '자기소개 — မိတ်ဆက်',
          '우리 가족 — မိသားစု',
          '주말 — ပိတ်ရက်',
          '한국에 가고 싶은 이유',
        ]}
        placeholder="저는 미얀마 사람입니다. ..."
      />
    ),
  },
];

/** Korean practice: Hangul first, then TOPIK words, speaking and AI writing correction. */
export default function KoreanPage() {
  return (
    <PracticeShell
      path="/korean"
      flag="🇰🇷"
      title="ကိုရီးယား စာ လေ့ကျင့်ရန်"
      subtitle="ဟန်ဂူလ် ဖတ်တတ်အောင် → စာလုံး → အသံထွက် → စာရေး — အဆင့်လိုက် လေ့ကျင့်ပါ"
      tabs={TABS}
    />
  );
}
