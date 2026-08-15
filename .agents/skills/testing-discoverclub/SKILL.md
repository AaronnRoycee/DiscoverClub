---
name: testing-discoverclub
description: How to run and E2E-test the DiscoverClub SPA (Vite + React, in-memory state)
---

# Testing DiscoverClub

- Start: `npm run dev` → http://localhost:5173. If node_modules is reinstalled, also run `npm install --no-save @rolldown/binding-linux-x64-gnu @oxlint/binding-linux-x64-gnu` (npm optional-deps bug for rolldown/oxlint native bindings).
- All state lives in React context at `src/store.tsx` (no backend). A page reload resets everything to the mock data — use a reload to get a clean-slate state before a test run; this is expected behavior, not a bug.
- Current user is hardcoded as `u1` (Aaron) via `CURRENT_USER_ID` in `src/store.tsx`. Profile edits at `/profile` propagate to the Home welcome header and to chat/review attribution for `u1`.
- Meet dates are generated relative to today (`daysFromNow`): m1 = today+3 (upcoming), m5 = today+17 (may fall in next calendar month), m2/m3/m4 are past. RSVP buttons only render for non-past meets.
- Useful invariants to assert: single vote per user on `/vote` (switching moves the vote, totals shift by 1); submitting a location on `/submit` auto-votes for it and hides the "Submit a Location" action row on Home; posting a review hides the review form for that meet (one review per user).
- Emoji typed via xdotool `type` may be dropped from input fields; avoid emoji in typed test strings or verify text without them.
