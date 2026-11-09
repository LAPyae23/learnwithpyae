'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import LessonVideoPlayer from './components/LessonVideoPlayer';
import LessonContent from './components/LessonContent';
import VocabGrammarSummary from './components/VocabGrammarSummary';
import EmbeddedQuiz from './components/EmbeddedQuiz';
import LessonSidebar from './components/LessonSidebar';

type Tab = 'content' | 'vocabulary' | 'grammar' | 'quiz';

export default function LessonViewerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'content', label: 'သင်ခန်းစာ', icon: '📖' },
    { id: 'vocabulary', label: 'ဝေါဟာရ', icon: '🗂️' },
    { id: 'grammar', label: 'သဒ္ဒါ', icon: '✏️' },
    { id: 'quiz', label: 'Quiz', icon: '📝' },
  ];

  return (
    <AppLayout activePath="/lesson">
      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>N5 သင်တန်း</span>
          <span className="text-border">›</span>
          <span>အခန်း ၄ — て ပုံစံ</span>
          <span className="text-border">›</span>
          <span className="text-foreground font-medium">သင်ခန်းစာ ၇ — て ပုံစံ ဆက်စပ်အသုံး</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              て ပုံစံ — လုပ်ရပ်များ ဆက်ခြင်းနဲ့ တောင်းဆိုခြင်း
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              て ပုံစံကို သုံးပြီး ကြိယာတွေ ဆက်နည်းနဲ့ ယဉ်ကျေးစွာ တောင်းဆိုနည်းကို လေ့လာပါမယ်။
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#006633]/10 text-[#006633] border border-[#006633]/20">
              N5 အဆင့်
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              ⏱ 18 မိနစ်
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Video + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Video + Tabs */}
        <div className="xl:col-span-2 space-y-5">
          <LessonVideoPlayer />

          {/* Tab Navigation */}
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
        </div>

        {/* Right: Lesson Sidebar */}
        <div className="xl:col-span-1">
          <LessonSidebar onTabChange={setActiveTab} />
        </div>
      </div>
    </AppLayout>
  );
}
