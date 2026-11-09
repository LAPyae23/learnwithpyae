'use client';
import React, { useState } from 'react';
import LessonContent from './LessonContent';
import VocabGrammarSummary from './VocabGrammarSummary';
import EmbeddedQuiz from './EmbeddedQuiz';

type Tab = 'content' | 'vocabulary' | 'grammar' | 'quiz';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'content', label: 'သင်ခန်းစာ', icon: '📖' },
  { id: 'vocabulary', label: 'ဝေါဟာရ', icon: '🗂️' },
  { id: 'grammar', label: 'သဒ္ဒါ', icon: '✏️' },
  { id: 'quiz', label: 'Quiz', icon: '📝' },
];

/** Interactive tabs of the built-in て-form lesson. */
export default function TeFormTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('content');
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-3 text-[13px] md:text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'text-[#006633] border-b-2 border-[#006633] bg-[#006633]/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="p-5">
        {activeTab === 'content' && <LessonContent />}
        {activeTab === 'vocabulary' && <VocabGrammarSummary type="vocabulary" />}
        {activeTab === 'grammar' && <VocabGrammarSummary type="grammar" />}
        {activeTab === 'quiz' && <EmbeddedQuiz />}
      </div>
    </div>
  );
}
