# learnwithpyae
A web application designed for Japanese language processing and translation, built with Next.js and Tailwind CSS.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- MongoDB (Mongoose) — MongoDB Atlas in production
- Auth: email + password (bcrypt), JWT in an httpOnly cookie, route protection in `src/middleware.ts`

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (see `.env.example`):
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017
   MONGODB_DB=nihongoacademy
   JWT_SECRET=<random 32+ chars>
   ```
   Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
3. Load flashcard content and the demo account (`student@nihongoacademy.demo` / `Demo@2026`):
   ```bash
   npm run seed
   ```
4. Start: `npm run dev` → http://localhost:4028

## Deploy to Vercel

1. Import this GitHub repo in Vercel.
2. Vercel → Storage → **MongoDB Atlas** → create a free cluster (region: Singapore) and connect it to the project. This adds `MONGODB_URI` automatically.
3. Project Settings → Environment Variables → add `JWT_SECRET` (a new random value, not the local one) and `MONGODB_DB=nihongoacademy`.
4. Seed the Atlas database once from your computer:
   ```bash
   vercel link
   vercel env pull .env.production.local
   npm run seed -- .env.production.local
   ```
5. Redeploy.

## Features and their setup

| Feature | Page | Needs |
|---|---|---|
| AI tutor (Burmese), "why was I wrong" on mock tests | `/sensei`, exam review | `GEMINI_API_KEY` (free) |
| Job-interview roleplay with voice + scored feedback | `/interview` | `GEMINI_API_KEY` (free); voice needs Chrome |
| Study planner + pass estimate | `/plan`, dashboard card | — |
| Kanji handwriting with stroke-order check | `/kanji` | — (stroke data from KanjiVG, CC BY-SA 3.0) |
| Pronunciation practice | `/speak` | Chrome / Android Chrome (Web Speech API) |
| Offline mode (installable PWA, offline flashcards) | all | — |
| Telegram daily reminders | profile → Telegram | `TELEGRAM_*`, `CRON_SECRET` |
| KBZPay / WavePay screenshot → admin approval | `/billing`, `/admin` | Accounts and prices: `/admin` → Settings |
| Video lessons (YouTube / .mp4 link) | `/lesson`, `/studio` | Admins and teachers write them in the Studio |
| Teachers: apply → admin approves → write lessons (Free / Premium) → admin publishes | `/teach`, `/studio`, `/admin` → ဆရာများ | — |
| Social: reactions, 5-star ratings, comments, views, teacher profiles, follow + feed | `/lesson`, `/teachers` | — |
| Teacher ↔ admin messages | `/messages` | Admin replies notify on Telegram |

**AI (free):** set `OPENROUTER_API_KEY` (https://openrouter.ai/keys, no credit card; free Gemma 4 models with automatic fallback)
or `GROQ_API_KEY` (https://console.groq.com/keys). Gemini (`GEMINI_API_KEY`) and Claude (`ANTHROPIC_API_KEY`)
also work. With no key the AI pages run in **demo mode** with canned answers marked "🧪 Demo"; set
`AI_DEMO=off` to hide them instead. AI keys are read at build time for showing the menu, so redeploy after adding one.
Each learner gets `AI_FREE_DAILY_LIMIT` uses per day (default 5); failed calls are not counted.

**Telegram:** create a bot with @BotFather, set the env vars on Vercel, deploy, then
`npm run telegram:setup -- .env.production.local`. Reminders go out daily at 08:00 Myanmar time (`vercel.json`).

**Admin account:** register on the website, then `npm run make-admin -- you@example.com .env.production.local`
and sign out/in. (Or create one directly: `SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD='…' npm run seed -- .env.production.local`.)

## Content

- Flashcards: `src/data/flashcards.ts` — add cards with a unique `key`, then `npm run seed` again (upserts, no duplicates).
- Kanji for handwriting: `src/data/kanjiList.ts`, then `npm run kanji:fetch` to download stroke data.
- Pronunciation drills: `src/data/speakPhrases.ts`.
- Plans, prices and payment accounts: `/admin` → Settings (defaults in `src/data/payment.ts`).
- Lessons: `/studio` (stored in MongoDB).

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create account, sign in |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/logout` | POST | Sign out |
| `/api/auth/me` | GET | Current user |
| `/api/decks` | GET | Decks with per-user due/new counts |
| `/api/decks/[slug]/session` | GET | Cards for one study session |
| `/api/reviews` | POST | Save a flashcard answer (SM-2 scheduling) |
| `/api/exam/attempts` | GET / POST | Mock test history / save a result |
| `/api/plan` | GET / PATCH | Study plan / update level, exam, minutes per day |
| `/api/ai/chat` | POST (stream) | AI tutor |
| `/api/ai/explain` | POST (stream) | Explain a mock-test answer |
| `/api/ai/interview` | POST (stream) | Interviewer turn |
| `/api/ai/interview/score` | POST | Structured interview feedback |
| `/api/ai/quota` | GET | Today's remaining AI uses |
| `/api/payments` | GET / POST | Own payments / upload screenshot |
| `/api/admin/payments[/id]` | GET / POST | Admin: list, view screenshot, approve/reject |
| `/api/telegram/link` | GET / POST / PATCH | Connect / manage Telegram |
| `/api/telegram/webhook` | POST | Telegram bot updates (secret header) |
| `/api/cron/daily` | GET | Daily reminders (Vercel Cron, `CRON_SECRET`) |
