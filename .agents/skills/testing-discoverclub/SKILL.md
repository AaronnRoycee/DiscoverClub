---
name: testing-discoverclub
description: How to run and E2E-test the DiscoverClub SPA (Vite + React), in demo mode (in-memory) and live mode (Supabase)
---

# Testing DiscoverClub

## Live mode (Supabase)

- Live mode activates when `.env.local` (repo root, untracked) provides `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`. Restart `npm run dev` after adding/changing it — Vite only reads env files at startup. Live mode shows an Auth (login/signup) page; demo mode goes straight to the Home Hub as mock user Aaron.
- Devin Secrets Needed: `SUPABASE_DB_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. DB access: `psql "host=aws-0-ca-central-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.<REF> sslmode=require"` with PGPASSWORD from the secret, where `<REF>` is the subdomain of `VITE_SUPABASE_URL`.
- Signup email domains are validated by Supabase — fake domains like `@discoverclub.app` are rejected ("Email address is invalid"); use gmail.com-style addresses. Signup requires email confirmation; confirm via SQL: `update auth.users set email_confirmed_at = now() where email = '...';` then log in.
- Supabase may return "email rate limit exceeded" on repeated signups. Workaround: insert a confirmed user directly into `auth.users` + `auth.identities` (bcrypt password via `crypt(pw, gen_salt('bf'))`), the DB trigger auto-creates the profile row.
- A profile row is auto-created on signup (trigger) with the name from signup metadata. Avatar/meet-photo uploads go to the public `photos` storage bucket; persisted URLs look like `…supabase.co/storage/v1/object/public/photos/…`.
- Proposal approval threshold in live mode = majority of members, min 2 (`src/store.tsx`). With 2 members, a second user's support auto-approves a proposal into an official meet.
- Auto-approval (since commit cbcb214) goes through a server-side SECURITY DEFINER Postgres function `approve_proposal(p_proposal_id, p_meet_id, p_photo_url)` that atomically checks the threshold, creates the meet, and inserts RSVP 'yes' rows for ALL supporters. Verify with `select user_id, status from rsvps where meet_id = ...` — expect one 'yes' row per supporter, and the count must survive a hard refresh for both users.
- Failed writes are logged as `[supabase] <context>: <msg>` console errors — check `browser_console` at the end of a run. (An old React "empty string passed to src" error was fixed in cbcb214 via DiceBear avatar fallbacks; if it reappears, that's a regression.)
- On the /submit page, filling address fields makes a "Preview on Map" link appear and shifts the Submit button down — re-screenshot before clicking Submit.

## Demo mode (no .env.local)

- Start: `npm run dev` → http://localhost:5173. If node_modules is reinstalled, also run `npm install --no-save @rolldown/binding-linux-x64-gnu @oxlint/binding-linux-x64-gnu` (npm optional-deps bug for rolldown/oxlint native bindings).
- All state lives in React context at `src/store.tsx` (no backend). A page reload resets everything to the mock data — use a reload to get a clean-slate state before a test run; this is expected behavior, not a bug.
- Current user is hardcoded as `u1` (Aaron) via `CURRENT_USER_ID` in `src/store.tsx`. Profile edits at `/profile` propagate to the Home welcome header and to chat/review attribution for `u1`.
- Meet dates are generated relative to today (`daysFromNow`): m1 = today+3 (upcoming), m5 = today+17 (may fall in next calendar month), m2/m3/m4 are past. RSVP buttons only render for non-past meets.
- Useful invariants to assert: single vote per user on `/vote` (switching moves the vote, totals shift by 1); submitting a location on `/submit` auto-votes for it and hides the "Submit a Location" action row on Home; posting a review hides the review form for that meet (one review per user).
- Emoji typed via xdotool `type` may be dropped from input fields; avoid emoji in typed test strings or verify text without them.
