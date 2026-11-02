# Marketplace search and pagination

Apply `supabase/migrations/202611030011_marketplace_search.sql` after 001–010 **before deploying**. This migration adds public, RLS-preserving read-only search and feed indexes. No dependency or Next.js configuration changes.

## Behavior

- Search filters all visible listings in PostgreSQL, not only a previously downloaded 60-item array. The old homepage reader and 60-item ceiling are removed. Listing/profile detail and saved-item readers keep their existing behavior.
- First page contains up to 24 items. Load more requests the next page using a validated cursor. Ordering is deterministic: newest timestamp/id; price ascending or descending with timestamp/id tie-breakers. One extra row establishes whether another page exists; no misleading total count is displayed.
- Search is a literal, case-insensitive substring across title, description, neighborhood and category. Unicode is retained; `%`, `_` and quotes have no wildcard/SQL meaning. Query text is bounded to 100 Unicode characters. It is not ranked full-text search; substring scans may need trigram indexing at a much larger data scale. Current indexes support newest/price ordering; country/category/price filtering stays in SQL.
- Price filtering/sorting requires a country. Uzbekistan uses so‘m and Korea uses KRW without exchange conversion. Country changes clear price bounds; clearing country also resets price sorting. Region selections are validated against the existing catalog.
- URL keys: `q`, `country`, `region`, `category`, `min`, `max`, `available=1`, `sort=price-asc|price-desc`. Reload and shared URLs reconstruct server-filtered first pages. Discrete filter changes push history; typing search/price replaces the current entry to avoid a Back entry per character. Back/Forward restores discrete filter states. Loaded pages themselves are not encoded into the shared URL.
- Native History API is used as documented by bundled Next.js App Router docs; URL changes avoid full RSC navigations per keystroke. Search requests debounce 300ms and stale requests are aborted/ignored. The selected country/region is synchronized to the shared location context for posting.
- Existing results remain visible while filters update, with a clear updating status. Failed pagination retains loaded items and offers retry. Invalid bounds show an error and do not fetch. Empty searches show an honest empty state; unavailable data shows an error/retry rather than sample products. The loading shell does not pretend sample items are real results.

## Access and limits

`search_listings` is SECURITY INVOKER, granted to anon/authenticated and explicitly restricted to active/reserved/sold items even for owners. Reports, blocks and private profiles are never joined. RPC limits are 25 rows and bounded filter values; HTTP pagination returns 24 items. Cursor input is bounded, validates UUID/price/ISO timestamp and preserves PostgreSQL microseconds. Its hash binds it to the filters; it is not an authorization token. All data remains subject to public read policies.

Concurrent listing edits can move items between price pages; append deduplicates IDs. Reload picks up new listings and price changes. This is a live feed, not a transaction snapshot. Sample detail pages remain available independently; production feed failures no longer substitute samples.

## Verification

Node tests cover filter round-trips, Unicode, invalid bounds, mixed-currency normalization, cursor precision/context/tampering and append deduplication. Disposable PostgreSQL tests search items beyond the old 60-item window and traverse 80 tied rows for all three sorts without duplicates or omissions. They cover combined filters, literal special characters, Korean text, removed-item privacy for anon/owners and bounded RPC arguments.

Hosted migration and a production smoke test remain owner follow-up; automated QA uses disposable local data only.

Browser QA used a local HTTP fixture backed by the actual migration/SQL search function (PGlite), not a second handwritten filter. Observed page sizes 24→48→72→82; an old-window item was found by search and survived reload. Combined country/region/category/price/availability/sort URL rehydration and Back/Forward passed. Failed next-page requests kept current cards; retry appended. Empty results and unavailable RPC states stayed distinct. Fast typing generated one request; a delayed stale response did not overwrite a later Korean query. Malformed cursors and invalid bounds returned HTTP 400. No real Supabase records were changed.

Additional browser checks passed: aborting Load more when filters change does not append stale items or leave loading stuck; selected country reaches the Sell form after navigation. Mobile/desktop screens were visually inspected and widths 320, 390, 680, 1024 and 1440px had no horizontal overflow. The existing white/teal design is retained.

Final checks: ESLint, TypeScript/production build, 30 Node tests and eleven disposable SQL suites passed. Changed surfaces: homepage server reader, public marketplace API, filter/cursor/data/client-feed modules, search/sort UI, shared location synchronization, read-only search migration and targeted tests. Production migration has not been applied.
