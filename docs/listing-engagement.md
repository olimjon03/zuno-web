# Listing engagement

Apply `supabase/migrations/202611030013_listing_engagement.sql` once in the hosted Supabase SQL Editor after migration 012. This change does not apply migrations remotely. Until it is applied, existing cards continue to work and omit unavailable counts.

Cards show an eye icon for cumulative daily unique listing views and a chat icon for distinct buyers who have actually sent a message. Empty conversations, seller-only messages and repeated messages from the same buyer do not increase the buyer count. Sample listings have no invented counts.

A view is recorded only when the real listing detail is visible in a visible browser tab. Feed rendering and route prefetching do not record views. Seller views are excluded when signed in. Signed-in viewers are deduplicated by user per listing per UTC day; anonymous viewers use a first-party HttpOnly, SameSite=Lax cookie lasting 24 hours (Secure in production). These are approximate counts, not verified unique humans: clearing cookies, using another anonymous browser, or signing in after an anonymous visit can increase counts.

Raw viewer keys are hashed, private and never returned to clients; no IP addresses or fingerprinting are collected. Per-listing raw keys older than two days are deleted on its next recorded view; cumulative totals remain. Inactive listings may retain old keys until another view or deletion. Only totals for active, reserved or sold listings are exposed. Deleted listings cascade away their view data.

Cards fetch aggregates in a single batch, with no per-card requests. Counts update on data refresh and may lag behind the existing 30-second client cache. Analytics errors never prevent viewing a listing. The same-origin POST endpoint uses the existing authenticated Supabase session and a cookie-bound visitor ID.

Validation: lint, TypeScript, production build, 53 Node tests, and transaction-based SQL tests covering daily deduplication, seller exclusion, distinct actual messagers, access restrictions, retention and removed listings. Browser QA uses an isolated local Supabase fixture; hosted OAuth and hosted database deployment require a live smoke test after migration.
