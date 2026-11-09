import { z } from 'zod';

/** Structured output schema for interview feedback (shared by API route and UI). */
const score = z.number().int().min(0).max(10);
export const InterviewScoreSchema = z.object({
  scores: z.object({
    politeness: score,
    grammar: score,
    vocabulary: score,
    fluency: score,
    content: score,
  }),
  overall: z.number().int().min(0).max(100).describe('Overall readiness, 0-100'),
  verdict: z.string().describe('One-sentence Burmese verdict'),
  strengths: z.array(z.string()).describe('Up to 3 strengths, in Burmese'),
  improvements: z.array(z.string()).describe('Up to 3 things to improve, in Burmese'),
  corrections: z
    .array(
      z.object({
        original: z.string().describe("The candidate's original Japanese phrase"),
        better: z.string().describe('A better Japanese phrase'),
        note: z.string().describe('Short Burmese explanation'),
      })
    )
    .describe('Up to 3 corrections'),
});
export type InterviewScore = z.infer<typeof InterviewScoreSchema>;
