/**
 * Scores a speech-recognition transcript against the expected phrase.
 * Recognizers may return kanji or kana, so we compare against both written forms
 * and take the best match.
 */

/** Katakana → hiragana, drop spaces/punctuation, unify long-vowel mark. */
export function normalizeJa(s: string) {
  return s
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s、。！？!?,.「」『』・〜~ー-]/g, (c) => (c === 'ー' ? 'ー' : ''))
    .trim();
}

export function levenshtein(a: string, b: string) {
  const A = Array.from(a);
  const B = Array.from(b);
  const dp = Array.from({ length: A.length + 1 }, (_, i) => [i, ...Array(B.length).fill(0)]);
  for (let j = 1; j <= B.length; j++) dp[0][j] = j;
  for (let i = 1; i <= A.length; i++) {
    for (let j = 1; j <= B.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[A.length][B.length];
}

function similarity(a: string, b: string) {
  const x = normalizeJa(a);
  const y = normalizeJa(b);
  if (!x || !y) return 0;
  return 1 - levenshtein(x, y) / Math.max(Array.from(x).length, Array.from(y).length);
}

export function scorePronunciation(
  transcript: string,
  forms: string[],
  confidence: number
): { score: number; match: number } {
  const match = Math.max(...forms.map((f) => similarity(transcript, f)));
  // Confidence from browsers is often 0 or unreliable; weight it lightly and only when present.
  const conf = confidence > 0 ? confidence : match;
  const score = Math.round((match * 0.85 + conf * 0.15) * 100);
  return { score: Math.max(0, Math.min(100, score)), match };
}
