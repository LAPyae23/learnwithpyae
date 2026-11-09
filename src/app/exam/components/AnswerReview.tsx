'use client';
import React, { useState } from 'react';
import type { Question, ExamAnswer } from '../page';
import { SECTION_INFO } from './ExamSetup';
import AiExplain from './AiExplain';

interface AnswerReviewProps {
  questions: Question[];
  answers: ExamAnswer[];
  onBack: () => void;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'skipped';
type SectionFilter = 'all' | 'grammar' | 'reading' | 'listening';

export default function AnswerReview({ questions, answers, onBack }: AnswerReviewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getAnswer = (qId: string) => answers.find((a) => a.questionId === qId);

  const filteredQuestions = questions.filter((q) => {
    const ans = getAnswer(q.id);
    const statusMatch =
      filter === 'all'
        ? true
        : filter === 'correct'
          ? ans?.isCorrect === true
          : filter === 'incorrect'
            ? ans?.isCorrect === false && ans?.selectedIndex !== null
            : filter === 'skipped'
              ? ans?.selectedIndex === null
              : true;
    const sectionMatch = sectionFilter === 'all' || q.section === sectionFilter;
    return statusMatch && sectionMatch;
  });

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.filter((a) => !a.isCorrect && a.selectedIndex !== null).length;
  const skippedCount = answers.filter((a) => a.selectedIndex === null).length;

  const filterButtons: { id: FilterType; label: string; count: number; color: string }[] = [
    { id: 'all', label: 'အားလုံး', count: questions.length, color: '#64748b' },
    { id: 'correct', label: 'မှန်', count: correctCount, color: '#006633' },
    { id: 'incorrect', label: 'မှား', count: incorrectCount, color: '#ef4444' },
    { id: 'skipped', label: 'မဖြေခဲ့', count: skippedCount, color: '#f59e0b' },
  ];

  const sectionButtons: { id: SectionFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'အပိုင်းအားလုံး', icon: '📋' },
    { id: 'grammar', label: 'သဒ္ဒါ', icon: '✏️' },
    { id: 'reading', label: 'စာဖတ်', icon: '📖' },
    { id: 'listening', label: 'နားထောင်', icon: '🎧' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button onClick={onBack} className="hover:text-foreground transition-colors">
              ← ရလဒ်
            </button>
            <span className="text-border">›</span>
            <span className="text-foreground font-medium">အဖြေ စစ်ဆေးခြင်း</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">အဖြေ အသေးစိတ်</h1>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          ← ရလဒ်သို့ ပြန်သွားမယ်
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5 space-y-3">
        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === btn.id
                  ? 'border-current text-white'
                  : 'border-border text-muted-foreground hover:border-current/40'
              }`}
              style={
                filter === btn.id
                  ? { backgroundColor: btn.color, borderColor: btn.color }
                  : { color: btn.color }
              }
            >
              {btn.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === btn.id ? 'bg-white/20' : 'bg-muted'
                }`}
                style={filter !== btn.id ? { color: btn.color } : {}}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {sectionButtons.map((btn) => {
            const isActive = sectionFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setSectionFilter(btn.id as SectionFilter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isActive
                    ? 'border-[#006633] bg-[#006633]/10 text-[#006633]'
                    : 'border-border text-muted-foreground hover:border-[#006633]/40'
                }`}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">ဒီ filter နဲ့ ကိုက်ညီတဲ့ မေးခွန်း မရှိပါ။</p>
          </div>
        )}

        {filteredQuestions.map((q, idx) => {
          const ans = getAnswer(q.id);
          const isCorrect = ans?.isCorrect;
          const isSkipped = ans?.selectedIndex === null || ans?.selectedIndex === undefined;
          const selectedIdx = ans?.selectedIndex ?? null;
          const isExpanded = expandedId === q.id;
          const si = SECTION_INFO[q.section];

          const qNumber = questions.findIndex((x) => x.id === q.id) + 1;

          return (
            <div
              key={q.id}
              className={`bg-card border rounded-xl overflow-hidden transition-all ${
                isSkipped
                  ? 'border-amber-200'
                  : isCorrect
                    ? 'border-[#006633]/30'
                    : 'border-red-200'
              }`}
            >
              {/* Question header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                {/* Status icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isSkipped
                      ? 'bg-amber-100 text-amber-600'
                      : isCorrect
                        ? 'bg-[#006633]/15 text-[#006633]'
                        : 'bg-red-100 text-red-500'
                  }`}
                >
                  {isSkipped ? '—' : isCorrect ? '✓' : '✗'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">Q{qNumber}</span>
                    <span className="text-xs">{si.icon}</span>
                    <span className="text-xs text-muted-foreground">{si.label}</span>
                    {q.grammarPoint && (
                      <span className="text-xs px-2 py-0.5 bg-[#006633]/10 text-[#006633] rounded-full border border-[#006633]/20">
                        {q.grammarPoint}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{q.question}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isSkipped && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isCorrect ? 'bg-[#006633]/10 text-[#006633]' : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {isCorrect ? 'မှန်' : 'မှား'}
                    </span>
                  )}
                  {isSkipped && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                      မဖြေခဲ့
                    </span>
                  )}
                  <span
                    className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-5 border-t border-border bg-muted/20">
                  {/* Context */}
                  {q.context && (
                    <div className="mt-4 bg-card border border-border rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {q.section === 'listening' ? '🎧 အသံ စာသား' : '📄 ဖတ်စာ'}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {q.context}
                      </p>
                    </div>
                  )}

                  {/* Question */}
                  <p className="text-sm font-semibold text-foreground mt-4 mb-3">{q.question}</p>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((option, optIdx) => {
                      const isCorrectOption = optIdx === q.correctIndex;
                      const isSelectedOption = optIdx === selectedIdx;
                      const isWrongSelection = isSelectedOption && !isCorrectOption;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isCorrectOption
                              ? 'border-[#006633]/50 bg-[#006633]/8'
                              : isWrongSelection
                                ? 'border-red-300 bg-red-50'
                                : 'border-border bg-card'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isCorrectOption
                                ? 'border-[#006633] bg-[#006633] text-white'
                                : isWrongSelection
                                  ? 'border-red-400 bg-red-400 text-white'
                                  : 'border-border text-muted-foreground'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span
                            className={`text-sm flex-1 ${
                              isCorrectOption
                                ? 'text-[#006633] font-semibold'
                                : isWrongSelection
                                  ? 'text-red-600 font-medium'
                                  : 'text-foreground'
                            }`}
                          >
                            {option}
                          </span>
                          {isCorrectOption && (
                            <span className="text-[#006633] text-xs font-bold">✓ အဖြေမှန်</span>
                          )}
                          {isWrongSelection && (
                            <span className="text-red-500 text-xs font-bold">✗ သင့်အဖြေ</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-1.5">💡 ရှင်းလင်းချက်</p>
                    <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
                  </div>

                  {!isCorrect && (
                    <AiExplain question={q} selectedIndex={ans?.selectedIndex ?? null} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom back button */}
      {filteredQuestions.length > 0 && (
        <div className="mt-6">
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all"
          >
            ← ရလဒ်သို့ ပြန်သွားမယ်
          </button>
        </div>
      )}
    </div>
  );
}
