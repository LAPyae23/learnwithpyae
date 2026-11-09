'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExamConfig, Question, ExamAnswer, SectionResult } from '../page';
import { SECTION_INFO } from './ExamSetup';

interface ExamSessionProps {
  config: ExamConfig;
  questions: Question[];
  onComplete: (answers: ExamAnswer[], results: SectionResult[]) => void;
}

type SectionType = 'grammar' | 'reading' | 'listening';

const SECTION_ORDER: SectionType[] = ['grammar', 'reading', 'listening'];

export default function ExamSession({ config, questions, onComplete }: ExamSessionProps) {
  const sections = SECTION_ORDER.filter((s) => config.sections.includes(s));
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sectionTimeLeft, setSectionTimeLeft] = useState<number>(
    SECTION_INFO[sections[0]].time * 60
  );
  const [sectionStartTime, setSectionStartTime] = useState<number>(Date.now());
  const [completedSections, setCompletedSections] = useState<SectionResult[]>([]);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSection = sections[sectionIndex];
  const sectionQuestions = questions.filter((q) => q.section === currentSection);
  const currentQuestion = sectionQuestions[questionIndex];
  const totalSectionQuestions = sectionQuestions.length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const finishSection = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - sectionStartTime) / 1000);
    const sectionQs = questions.filter((q) => q.section === currentSection);
    let score = 0;
    sectionQs.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    const result: SectionResult = {
      section: currentSection,
      score,
      total: sectionQs.length,
      timeTaken,
    };
    const newCompleted = [...completedSections, result];
    setCompletedSections(newCompleted);

    if (sectionIndex + 1 < sections.length) {
      setShowSectionTransition(true);
    } else {
      // Build final answers array
      const finalAnswers: ExamAnswer[] = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? null,
        isCorrect: answers[q.id] === q.correctIndex,
      }));
      onComplete(finalAnswers, newCompleted);
    }
  }, [
    answers,
    completedSections,
    currentSection,
    onComplete,
    questions,
    sectionIndex,
    sectionStartTime,
    sections.length,
  ]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          finishSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finishSection]);

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
  };

  const handleNext = () => {
    if (questionIndex + 1 < totalSectionQuestions) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(answers[sectionQuestions[questionIndex + 1]?.id] ?? null);
    } else {
      finishSection();
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
      setSelectedOption(answers[sectionQuestions[questionIndex - 1]?.id] ?? null);
    }
  };

  const handleStartNextSection = () => {
    const nextIdx = sectionIndex + 1;
    setSectionIndex(nextIdx);
    setQuestionIndex(0);
    setSelectedOption(null);
    setSectionTimeLeft(SECTION_INFO[sections[nextIdx]].time * 60);
    setSectionStartTime(Date.now());
    setShowSectionTransition(false);
  };

  const timerPercent = (sectionTimeLeft / (SECTION_INFO[currentSection].time * 60)) * 100;
  const isLowTime = sectionTimeLeft < 120;

  // Section transition screen
  if (showSectionTransition) {
    const nextSection = sections[sectionIndex + 1];
    const nextInfo = SECTION_INFO[nextSection];
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-card border border-border rounded-2xl p-10 w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {SECTION_INFO[currentSection].label} ပြီးပါပြီ!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">နောက်အပိုင်း မစခင် ခဏ အနားယူပါ။</p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              နောက်အပိုင်း
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextInfo.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{nextInfo.label}</p>
                <p className="text-xs text-muted-foreground">
                  {nextInfo.count} ပုဒ် · {nextInfo.time} မိနစ်
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartNextSection}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-[#006633] hover:bg-[#005229] transition-colors"
          >
            {nextInfo.label} စမယ် →
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const answeredCount = sectionQuestions.filter((q) => answers[q.id] !== undefined).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Exam Header */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between gap-4">
          {/* Section tabs */}
          <div className="flex items-center gap-2">
            {sections.map((s, i) => {
              const si = SECTION_INFO[s];
              const isDone = i < sectionIndex;
              const isCurrent = i === sectionIndex;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-[#006633]/10 text-[#006633] border border-[#006633]/30'
                      : isDone
                        ? 'bg-muted text-muted-foreground line-through'
                        : 'text-muted-foreground'
                  }`}
                >
                  <span>{si.icon}</span>
                  <span className="hidden sm:inline">{si.label}</span>
                  {isDone && <span>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm transition-all ${
              isLowTime
                ? 'border-red-300 bg-red-50 text-red-600 animate-pulse'
                : 'border-border bg-muted/50 text-foreground'
            }`}
          >
            <span>{isLowTime ? '⚠️' : '⏱'}</span>
            <span>{formatTime(sectionTimeLeft)}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timerPercent}%`,
              backgroundColor: isLowTime ? '#ef4444' : '#006633',
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-5">
        {/* Question header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm">{SECTION_INFO[currentSection].icon}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {SECTION_INFO[currentSection].label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {answeredCount}/{totalSectionQuestions} ဖြေပြီး
            </span>
            <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full">
              မေးခွန်း {questionIndex + 1} / {totalSectionQuestions}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Context passage */}
          {currentQuestion.context && (
            <div className="bg-muted/40 border border-border rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {currentSection === 'listening' ? '🎧 အသံ စာသား' : '📄 ဖတ်စာ'}
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {currentQuestion.context}
              </p>
            </div>
          )}

          {/* Grammar point badge */}
          {currentQuestion.grammarPoint && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#006633]/10 text-[#006633] text-xs font-medium rounded-full mb-4 border border-[#006633]/20">
              ✏️ {currentQuestion.grammarPoint}
            </div>
          )}

          {/* Question */}
          <p className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-[#006633] bg-[#006633]/5'
                      : 'border-border hover:border-[#006633]/40 hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#006633] bg-[#006633] text-white'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={`text-sm font-medium ${isSelected ? 'text-[#006633]' : 'text-foreground'}`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={questionIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← နောက်သို့
        </button>

        {/* Question dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {sectionQuestions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = i === questionIndex;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setQuestionIndex(i);
                  setSelectedOption(answers[q.id] ?? null);
                }}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#006633] text-white scale-110'
                    : isAnswered
                      ? 'bg-[#006633]/20 text-[#006633] border border-[#006633]/40'
                      : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#006633] hover:bg-[#005229] transition-all"
        >
          {questionIndex + 1 === totalSectionQuestions
            ? sectionIndex + 1 === sections.length
              ? 'စာမေးပွဲ ပြီးပြီ'
              : 'နောက်အပိုင်း →'
            : 'ရှေ့သို့ →'}
        </button>
      </div>
    </div>
  );
}
