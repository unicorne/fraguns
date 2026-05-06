# FragUns

A small PWA that gives a friend group **one new question every day**. Members answer in the app, push notifications go out, results show after the deadline, and a comment thread lets the group banter under each question.

Live at [fraguns.vercel.app](https://fraguns.vercel.app).

## What it does

- **Groups** with invite codes — anyone with the code can join under a chosen name.
- **One active question per group per day**, picked automatically by a cron job.
- **Question types**: free text (`FREITEXT`), 1–N scale (`SKALA`), poll (`POLL`), and team split (`TEAM_SPLIT`).
- **Question pool**: a curated pool in [`questions.json`](./questions.json) seeds groups; members can also submit their own questions, which are prioritized via round-robin between submitters before falling back to the pool.
- **Push notifications** via Web Push (VAPID) when a new question goes live.
- **Comments** thread under each question, plus per-question ratings and per-user avatars.
- **PWA**: installable on iOS/Android with [`public/manifest.json`](./public/manifest.json) and [`public/sw.js`](./public/sw.js).
- No real auth — identity is a name + a `userId` in `localStorage`. Server access is gated by the Supabase service role key inside API routes.

## Installation (PWA)

FragUns is a Progressive Web App — there is no App Store / Play Store listing. Install it directly from the browser. **Important on iOS**: push notifications only work if the app is installed to the home screen. Just bookmarking the URL is not enough.

### iOS (iPhone / iPad)

Use **Safari** — Chrome and Firefox on iOS don't support PWA install.

1. Open [fraguns.vercel.app](https://fraguns.vercel.app) in Safari.
2. Tap the **Share** button (square with the up-arrow) at the bottom of the screen.
3. Scroll down and tap **Zum Home-Bildschirm** ("Add to Home Screen").
4. Tap **Hinzufügen** ("Add") in the top right.
5. Open FragUns from the new home-screen icon. The first time the app opens, allow notifications when prompted.

If you don't get the notification prompt automatically, go to **Profil → Push-Benachrichtigungen** in the app.

### Android

Works in **Chrome**, **Edge**, **Samsung Internet**, **Firefox**, and most Chromium-based browsers.

1. Open [fraguns.vercel.app](https://fraguns.vercel.app).
2. Either:
   - Tap the **"App installieren"** banner Chrome shows automatically, **or**
   - Open the browser menu (⋮ in the top right) and tap **App installieren** / **Zum Startbildschirm hinzufügen**.
3. Confirm the install dialog.
4. Open FragUns from your home screen / app drawer and allow notifications when prompted.

### Desktop (optional)

In Chrome/Edge on Mac/Windows you can also install it from the URL bar — look for the install icon (a small monitor with a down-arrow) on the right side of the address bar. Useful for testing notifications during development.

### Troubleshooting

- **No notifications on iOS**: the app must be installed to the home screen *and* opened from there at least once. Check **Settings → Notifications → FragUns** is enabled.
- **No notifications on Android**: open the app, go to **Profil → Push-Benachrichtigungen** and re-enable. If nothing happens, check the system-level notification permission for the browser/PWA.
- **Install option missing**: the device probably already has it installed, or the browser doesn't support PWAs (e.g. iOS Chrome). Open Safari instead.

## Stack

- [Next.js 16](https://nextjs.org) App Router (with Turbopack), React 19, TypeScript, Tailwind 4
- [Supabase](https://supabase.com) Postgres for storage (accessed only from server routes via the service role key)
- [`web-push`](https://www.npmjs.com/package/web-push) for VAPID-signed push notifications
- Hosted on [Vercel](https://vercel.com); cron on Vercel + a local LaunchAgent fallback

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
```

You need a `.env.local` with the variables listed below. Copy from `.env.example` and fill in.

### Required environment variables

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (server only) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | same generator |
| `VAPID_SUBJECT` | `mailto:you@example.com` |
| `CRON_SECRET` | random 32-byte hex; gates the cron endpoint |

## Deployment

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations in [`supabase/migrations/`](./supabase/migrations) **in order**:
   - `001_initial_schema.sql` — groups, members, questions, answers
   - `002_global_users.sql` — global user accounts
   - `003_question_ratings.sql` — per-question ratings
   - `004_new_question_types.sql` — adds `TEAM_SPLIT`, etc.
   - `005_team_split_ranking.sql` — ranking inside team-split results
   - `006_comments.sql` — per-question comment thread
3. Copy `Project URL`, `anon` key, and `service_role` key from Settings → API.

RLS is enabled on all tables; all policies allow full access because every read/write goes through Next.js API routes that authenticate with the service role key. The anon key is only used for public reads where it doesn't matter (currently mostly server-side too — see [`src/lib/supabase.ts`](./src/lib/supabase.ts) and [`src/lib/supabase-server.ts`](./src/lib/supabase-server.ts)).

### Vercel

1. Import the repo on [vercel.com/new](https://vercel.com/new).
2. Add all env vars above in **Project Settings → Environment Variables** for Production (and Preview if you want PR deploys to work end-to-end).
3. Deploy. Framework detection picks up Next.js automatically; no extra build config.
4. The cron in [`vercel.json`](./vercel.json) runs `GET /api/cron/daily` at `0 19 * * *` (19:00 UTC). Vercel's scheduler enforces it on the Hobby/Pro plan.

### Cron — how the daily question gets activated

[`src/app/api/cron/daily/route.ts`](./src/app/api/cron/daily/route.ts) does the following for **every** group:

1. Deactivates the previous active question.
2. Picks the next question — user-submitted questions first (round-robin between submitters), then a random unused pool question.
3. Sets `is_active = true`, `scheduled_date = today`, and `deadline = 22:59 UTC`.
4. Sends Web Push to every member with a saved subscription.

The endpoint is protected by `Authorization: Bearer $CRON_SECRET`.

There are **two triggers** in production today:

- **Vercel cron** (primary) — configured in `vercel.json`.
- **macOS LaunchAgent** (`~/Library/LaunchAgents/com.fraguns.cron.plist`) — runs hourly on the local machine as a redundancy. The endpoint is idempotent per day, so re-runs are safe.

You can also trigger it manually with [`./trigger-cron.sh`](./trigger-cron.sh). The script reads `CRON_SECRET` from `.env.local`, so make sure that file exists locally before running it:

```bash
chmod +x trigger-cron.sh   # first time only
./trigger-cron.sh
```

It hits the production endpoint (`https://fraguns.vercel.app/api/cron/daily`) and prints the JSON response. Re-running on the same day is safe — the cron is idempotent per group per day.

## Maintaining the app

### Adding new pool questions

Pool questions live in [`questions.json`](./questions.json). The format:

```json
{ "type": "FREITEXT", "question": "..." }
{ "type": "SKALA", "question": "...", "scale_max": 10 }
{ "type": "POLL", "question": "..." }
{ "type": "TEAM_SPLIT", "question": "...", "team_labels": ["A", "B"] }
{ "type": "RANKING", "question": "..." }
```

The cron reads from the `questions` table in Supabase, not the JSON file directly. To seed new pool questions into a group, insert rows with `created_by = NULL` and `scheduled_date = NULL`.

#### Generating new questions with an LLM

The [`create_question/`](./create_question) folder contains a full generate-then-upload workflow:

- [`create_question/prompt.md`](./create_question/prompt.md) — the LLM prompt. Paste it into any capable model, replace `{N}` with how many questions you want. The prompt instructs the model to read all existing questions (`questions.json`, `default-questions.ts`, and every previous batch in `create_question/questions/`) so it doesn't generate duplicates.
- [`create_question/examples.json`](./create_question/examples.json) — curated reference questions covering all 5 types; helps anchor the style.
- [`create_question/questions/`](./create_question/questions) — drop the model's output here as `<date>.json` (e.g. `2026-05-06.json`). One file per generation run.
- [`create_question/upload.mjs`](./create_question/upload.mjs) — uploads every batch file to Supabase. Maps the JSON pool format → DB rows (`FREITEXT` → `text`, `SKALA` → `scale`, etc.) and inserts into **every existing group's** `questions` table with `created_by = NULL` and `scheduled_date = NULL`, so the cron picks them up. **Idempotent** — skips any question whose text already exists in that group, so re-runs are safe.

Workflow:

```bash
# 1. Run the prompt in your LLM of choice → save the JSON output as
#    create_question/questions/2026-05-06.json
# 2. Push to the DB:
node --env-file=.env.local create_question/upload.mjs
```

Note: `upload.mjs` only adds questions to **existing** groups. If you want newly-created groups to inherit them too, also append the matching entries to [`src/lib/default-questions.ts`](./src/lib/default-questions.ts) (which is what's seeded when a group is created).

### Adding a database change

1. Add a new file in `supabase/migrations/` named `00N_what_it_does.sql`.
2. Run it in the Supabase SQL editor against production.
3. Commit the file so the schema history stays in the repo.

There is no automated migration runner — keep migrations idempotent (`IF NOT EXISTS`, etc.) so re-runs don't break.

### Rotating secrets

- **`CRON_SECRET`**: update in Vercel env, in `.env.local` (the script reads it from there), and in `~/Library/LaunchAgents/com.fraguns.cron.plist` (then `launchctl unload && launchctl load` the plist).
- **VAPID keys**: regenerating invalidates every existing push subscription — users have to re-grant notifications. Avoid unless necessary.
- **Supabase service role key**: rotate in Supabase, then update Vercel env and redeploy.

### Monitoring

- **Vercel** → Deployments → Functions → `/api/cron/daily` shows the cron output (the route returns a `log` array).
- **LaunchAgent log**: `/tmp/fraguns-cron.log` on the local machine.
- **Supabase** → Logs for DB-level errors.

### Common things that go wrong

- **No question went out today**: check the cron log. Either no unscheduled questions are left for that group (seed more pool questions) or the secret is wrong.
- **Push notifications silently fail**: usually an expired subscription. The cron logs each `webpush.sendNotification` result; subscriptions returning `410 Gone` should be cleared from `members.push_subscription`.
- **iOS users don't get pushes**: the app must be installed to the home screen first; Safari only delivers push to installed PWAs.
