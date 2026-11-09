'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ExamSetup from './components/ExamSetup';
import ExamSession from './components/ExamSession';
import ExamResults from './components/ExamResults';
import AnswerReview from './components/AnswerReview';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type SectionType = 'grammar' | 'reading' | 'listening';

export interface Question {
  id: string;
  section: SectionType;
  level: JLPTLevel;
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  grammarPoint?: string;
}

export interface SectionResult {
  section: SectionType;
  score: number;
  total: number;
  timeTaken: number; // seconds
}

export interface ExamConfig {
  level: JLPTLevel;
  sections: SectionType[];
}

export interface ExamAnswer {
  questionId: string;
  selectedIndex: number | null;
  isCorrect: boolean;
}

type ExamPhase = 'setup' | 'exam' | 'results' | 'review';

export default function JLPTExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [config, setConfig] = useState<ExamConfig>({
    level: 'N5',
    sections: ['grammar', 'reading', 'listening'],
  });
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleStart = (cfg: ExamConfig, qs: Question[]) => {
    setConfig(cfg);
    setQuestions(qs);
    setAnswers([]);
    setSectionResults([]);
    setPhase('exam');
  };

  const handleExamComplete = (ans: ExamAnswer[], results: SectionResult[]) => {
    setAnswers(ans);
    setSectionResults(results);
    setPhase('results');
    api('/api/exam/attempts', {
      method: 'POST',
      json: {
        level: config.level,
        sections: config.sections,
        sectionResults: results.map((r) => ({ ...r, timeTaken: Math.round(r.timeTaken) })),
        answers: ans,
      },
    }).catch((err) => toast.error(`ရလဒ် မသိမ်းနိုင်ပါ — ${(err as Error).message}`));
  };

  const handleReview = () => setPhase('review');
  const handleRetake = () => setPhase('setup');

  return (
    <AppLayout activePath="/exam">
      {phase === 'setup' && <ExamSetup onStart={handleStart} />}
      {phase === 'exam' && (
        <ExamSession config={config} questions={questions} onComplete={handleExamComplete} />
      )}
      {phase === 'results' && (
        <ExamResults
          config={config}
          sectionResults={sectionResults}
          answers={answers}
          questions={questions}
          onReview={handleReview}
          onRetake={handleRetake}
        />
      )}
      {phase === 'review' && (
        <AnswerReview questions={questions} answers={answers} onBack={() => setPhase('results')} />
      )}
    </AppLayout>
  );
}
