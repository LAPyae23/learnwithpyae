'use client';
import React from 'react';
import type { ExamConfig, Question, ExamAnswer, SectionResult } from '../page';
import { SECTION_INFO, LEVEL_INFO } from './ExamSetup';

interface ExamResultsProps {
  config: ExamConfig;
  sectionResults: SectionResult[];
  answers: ExamAnswer[];
  questions: Question[];
  onReview: () => void;
  onRetake: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getGrade(percent: number): { label: string; color: string; emoji: string } {
  if (percent >= 90) return { label: 'အလွန်ကောင်း', color: '#006633', emoji: '🏆' };
  if (percent >= 75) return { label: 'ကောင်း', color: '#3b82f6', emoji: '⭐' };
  if (percent >= 60) return { label: 'အောင်', color: '#f59e0b', emoji: '✅' };
  return { label: 'ထပ်ကြိုးစားရန်', color: '#ef4444', emoji: '📚' };
}

export default function ExamResults({
  config,
  sectionResults,
  answers,
  questions,
  onReview,
  onRetake,
}: ExamResultsProps) {
  const totalScore = sectionResults.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = sectionResults.reduce((sum, r) => sum + r.total, 0);
  const totalPercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const totalTime = sectionResults.reduce((sum, r) => sum + r.timeTaken, 0);
  const grade = getGrade(totalPercent);
  const levelInfo = LEVEL_INFO[config.level];

  // Passing threshold for JLPT is roughly 60%
  const passed = totalPercent >= 60;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>လေ့ကျင့်ရန်</span>
          <span className="text-border">›</span>
          <span>JLPT Mock Test</span>
          <span className="text-border">›</span>
          <span className="text-foreground font-medium">Results</span>
        </div>
      </div>

      {/* Score Hero */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-5 text-center">
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{totalPercent}%</h1>
        <p className="text-lg font-semibold mb-1" style={{ color: grade.color }}>
          {grade.label}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {totalQuestions} ပုဒ်တွင် {totalScore} ပုဒ် မှန် · {formatTime(totalTime)}
        </p>

        {/* Pass/Fail badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
            passed
              ? 'bg-[#006633]/10 text-[#006633] border-[#006633]/30'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          <span>{passed ? '✓' : '✗'}</span>
          <span>
            {passed
              ? `${config.level} စမ်းသပ်ဖြေဆိုမှု အောင်ပါပြီ`
              : `${config.level} — ဆက်ကြိုးစားပါ`}
          </span>
        </div>

        {/* Score ring */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={grade.color}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalPercent / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{totalPercent}%</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: levelInfo.color, backgroundColor: levelInfo.bg }}
              >
                {config.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <h2 className="text-base font-semibold text-foreground mb-4">အပိုင်းအလိုက် ရလဒ်</h2>
        <div className="space-y-4">
          {sectionResults.map((result) => {
            const si = SECTION_INFO[result.section];
            const pct = Math.round((result.score / result.total) * 100);
            const sg = getGrade(pct);
            return (
              <div key={result.section} className="flex items-center gap-4">
                <span className="text-xl flex-shrink-0">{si.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{si.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(result.timeTaken)}
                      </span>
                      <span className="text-sm font-bold" style={{ color: sg.color }}>
                        {result.score}/{result.total}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: sg.color, backgroundColor: `${sg.color}15` }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: sg.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-level summary */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <h2 className="text-base font-semibold text-foreground mb-4">အဖြေ အကျဉ်း</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3 bg-[#006633]/5 border border-[#006633]/20 rounded-lg">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-xl font-bold text-[#006633]">
                {answers.filter((a) => a.isCorrect).length}
              </p>
              <p className="text-xs text-muted-foreground">မှန်</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-xl font-bold text-red-500">
                {answers.filter((a) => !a.isCorrect).length}
              </p>
              <p className="text-xs text-muted-foreground">မှား</p>
            </div>
          </div>
        </div>

        {/* Mini question grid */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const ans = answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.isCorrect;
            const isSkipped = ans?.selectedIndex === null;
            return (
              <div
                key={q.id}
                title={`${i + 1}: ${isSkipped ? 'မဖြေခဲ့' : isCorrect ? 'မှန်' : 'မှား'}`}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                  isSkipped
                    ? 'bg-muted border-border text-muted-foreground'
                    : isCorrect
                      ? 'bg-[#006633]/15 border-[#006633]/40 text-[#006633]'
                      : 'bg-red-50 border-red-200 text-red-500'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all"
        >
          ↺ ပြန်ဖြေမယ်
        </button>
        <button
          onClick={onReview}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[#006633] hover:bg-[#005229] transition-all"
        >
          📖 အဖြေများ ကြည့်မယ်
        </button>
      </div>
    </div>
  );
}
