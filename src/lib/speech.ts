'use client';
/**
 * Browser speech helpers (Web Speech API). Free and on-device/browser-provided:
 * works in Chrome / Edge / Android Chrome; Safari supports synthesis and partial recognition.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings — the Web Speech recognition API isn't in TypeScript's DOM lib yet.
interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechRecognitionSupported() {
  return getRecognitionCtor() !== null;
}

/** Speaks Japanese (or other) text with the browser's voice. Strips the Burmese/notes lines. */
export function speak(text: string, lang = 'ja-JP', rate = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

const ERRORS: Record<string, string> = {
  'not-allowed':
    'Microphone ခွင့်ပြုချက် မရှိပါ။ Browser setting မှာ microphone ကို ခွင့်ပြုပေးပါ။',
  'no-speech': 'အသံ မကြားရပါ။ ထပ်ပြောကြည့်ပါ။',
  'audio-capture': 'Microphone ရှာမတွေ့ပါ။',
  network: 'အသံ မှတ်မိခြင်းအတွက် internet လိုပါတယ်။',
};

/**
 * Hook for one-shot speech recognition.
 * `start()` listens until the speaker pauses, then calls `onFinal` with the transcript and confidence (0–1).
 */
export function useSpeechRecognition(
  lang: string,
  onFinal: (transcript: string, confidence: number) => void
) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    setSupported(speechRecognitionSupported());
    return () => recRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    stopSpeaking();
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      let confidence = 0;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalText += r[0].transcript;
          confidence = r[0].confidence;
        } else interimText += r[0].transcript;
      }
      setInterim(interimText);
      if (finalText) onFinalRef.current(finalText.trim(), confidence || 0);
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERRORS[e.error] ?? 'အသံ မှတ်မိခြင်း မအောင်မြင်ပါ။');
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };
    setError(null);
    setListening(true);
    recRef.current = rec;
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { start, stop, listening, interim, error, supported };
}
