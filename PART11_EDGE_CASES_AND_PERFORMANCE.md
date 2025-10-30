# PART 11: EDGE CASES & ERROR SCENARIOS

## 11.1 What Could Go Wrong?

### Judge0 Crashes
- **UI copy**: Display `"Code execution service is down. Try again in 5 minutes."` in the submission status panel. Keep previous verdicts visible.
- **Recovery plan**: Pause verdict resolution but keep the battle timer running. Queue all pending submissions, then auto-retry the Judge0 request every 30 seconds until success or a manual abort from staff tooling.
- **User feedback loop**: Show a retry countdown (30 → 29 → …) and surface a toast when service recovers. Log incident to Sentry and include Judge0 response payload.
- **Battle integrity**: Never mark the battle as failed. Delay the verdict; when Judge0 returns, resume normal flow and backfill missing verdicts in chronological order.

### Database Connection Lost
- **UI copy**: Display `"Database sync lost. Retrying..."` inside the connection banner with a subtle warning state.
- **Offline queueing**: Buffer submissions locally (IndexedDB for browser, in-memory store for SSR fallbacks). Include problem ID, language, code snapshot hash, and timestamp.
- **Retry cadence**: Attempt reconnection with exponential backoff capped at 30 seconds. Flush the buffered submissions once Supabase confirms reconnection.
- **User reassurance**: When sync restores, show `"All caught up — submissions synced"` as a confirmation toast and clear the warning banner.

### Opponent Disconnects Mid-Battle
- **Grace period**: Track disconnect timestamp server-side. If the opponent remains offline for ≥ 5 minutes, mark them as forfeited.
- **UI copy upon forfeit**: Display `"Victory! Opponent abandoned battle"` and trigger the rating update flow (opponent loses rating, current user gains rating per standard ELO rules).
- **Countdown feedback**: While waiting, show remaining grace time (e.g., `"Opponent disconnected. Forfeit in 04:12"`) and allow the connected player to continue coding.

### User Joins Then Immediately Leaves Queue
- **Single decline**: If a user declines a match after being paired, place them back in the queue with no penalty.
- **Abuse prevention**: Track consecutive declines. After 3 immediate declines, enforce a 5-minute cooldown with clear messaging (`"Queue cooldown: 5 minutes for repeated declines"`).
- **State reset**: Successful acceptance resets the decline counter.

### Tie Score in Battle
- **Draw conditions**: Trigger when both teams submit identical scores with identical completion timestamps (rounded to the authoritative server clock).
- **Outcome handling**: Apply a flat `+10` rating adjustment to both competitors and mark the battle outcome as `draw`.
- **UI copy**: Display `"Draw! Excellent match."` in the post-battle modal and leaderboard event feed.

## 11.2 Data Validation

### Client-Side Guardrails
- **Code payload**: Ensure the submission text is non-null and non-empty before enabling the submit button.
- **Payload size**: Block submissions larger than 10 MB to prevent browser freezes. Surface a friendly alert explaining the limit and suggesting file cleanup.
- **Language selection**: Require a language choice (dropdown or keyboard shortcut) before submission. Default to the last used language when possible.

### Server-Side Enforcement
- **Submission eligibility**: Verify the user is an active participant in the battle and that the battle state is not `ended` or `forfeited`.
- **Problem integrity**: Confirm the problem exists and is linked to the active battle round. Reject orphaned or tampered problem IDs.
- **Rate limiting**: Enforce a minimum 2-second window between submissions per user (per battle). Respond with HTTP 429 when exceeded and inform the client to slow down.
- **Battle status**: Double-check that the battle remains active before accepting submissions. Reject with a structured error when the battle has concluded.

---

# PART 12: PERFORMANCE & SCALE CONSIDERATIONS

## 12.1 Expected Load

- **Concurrent population (10,000 users)**:
  - ~1,000 users in active battles (≈500 simultaneous battles)
  - ~3,000 users practicing in solo mode
  - ~2,000 browsing problems or leaderboards
  - ~4,000 idle, connected for notifications
- **Database throughput**: Each battle averages ~10 queries/minute (submission writes, verdict updates, leaderboard adjustments). At full load this totals ~10,000 queries/minute, well within Supabase limits when indexes are tuned.
- **Realtime footprint**: Expect up to 10,000 concurrent Supabase Realtime connections. Monitor channel counts, fan-out latency, and reserved connection quota.

## 12.2 Optimization Priorities

### First-Priority (≈99% Impact)
- **Problem caching**: Cache problem statements and metadata (Redis or Supabase cache tables) to avoid redundant fetches and reduce load on third-party APIs.
- **Lazy leaderboard loading**: Fetch leaderboard pages on demand, paginate aggressively, and prefetch only the immediate next page.
- **Judge0 efficiency**: Batch submissions when users spam retries, reuse execution tokens when supported, and short-circuit duplicate submissions (same code hash within cooldown).

### Second-Priority (≈9% Impact)
- **Asset optimization**: Compress and optimize images; ensure responsive delivery formats (WebP/AVIF when available).
- **Bundle hygiene**: Leverage Next.js/Vercel automatic CSS/JS minification and code-splitting; audit for oversized client bundles.
- **Database indexing**: Add and validate indexes on frequently filtered columns (battle status, user ID, rating, created_at) and analyze query plans regularly.
- **Measured optimization**: Defer additional tuning until profiling data identifies true hotspots. Instrument basic telemetry first, then iterate.

