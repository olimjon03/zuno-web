# Individual listing statistics

Apply `supabase/migrations/202611030015_listing_statistics.sql` after 014.

Your listings has a chart icon and View statistics link per item. Desktop uses a two-column listing layout and four metrics across; mobile stacks cards and uses two metric columns. Inline counts are intentionally omitted from management cards, matching the approved concept.

`/account/listings/[id]/statistics` checks the signed-in seller on the server. The statistics RPC independently verifies ownership and rejects missing/removed items, anonymous callers and invalid periods. Raw daily records have no client table grants. Only aggregate counts are returned.

7-day/30-day periods include today in UTC. All time uses existing lifetime totals for views. Daily history starts when migration 015 is applied, so older totals cannot be reconstructed into a chart. Likes and saves count currently retained entries created during the selected period; messages count distinct buyers who actually sent a message during that period. Daily views follow the existing per-browser/account/day deduplication and exclude seller views. Long all-time charts group consecutive dates into at most 30 buckets; the accessible table has the same data.

No made-up production counters, percentages or historical data. RPC failures show retry without substituting zero totals. Filter changes discard prior-period metrics and ignore stale responses. Back/home navigation and English/Uzbek/Korean translations are included.

Validation: lint, TypeScript, existing Node suites, migration + transactional SQL assertions for owner/anonymous/stranger access, counts, deduplication, owner exclusion, period validation, raw history privacy and removed listing denial. Local disposable fixtures exercise UI without accessing production accounts.
