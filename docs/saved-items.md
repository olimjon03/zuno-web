# Account saved items

Apply `supabase/migrations/202611020003_favorites.sql` in Supabase SQL Editor after the first two migrations. This migration has not been applied to the hosted project by this change. No new environment variables or admin key are needed. Until it is applied, signed-in users receive a saved-items availability notice and failed writes do not change the heart state.

Real listing hearts persist to the authenticated account. Account → Saved items opens `/account/saved`. The server rechecks Auth for reads and writes and derives the user ID from Auth. RLS restricts favorite rows to their owner, permits saving only visible listings, and permits unsaving items even after removal. Duplicate saves are idempotent. The page hides removed listings and shows up to the latest 1,000 saved items. Sample listing hearts remain in memory for the current visit and never enter the database.

The provider reloads after navigation and auth changes, clears the prior account’s state and discards stale async results. Saves update hearts only after server confirmation. Errors have an accessible status notice; signed-out visitors receive a login link. Saved items can be removed directly from their cards.

Validation: lint, production build, eight existing Node validation tests, and `supabase/tests/favorites.sql` in disposable PostgreSQL/PGlite after all migrations. The SQL suite checks ownership privacy, forged inserts, duplicates, cross-user deletion, anonymous denial, removed-item visibility and unsaving removed items. It rolls back fixtures; do not run it against a live marketplace.

Local Playwright Auth/REST fixtures cover anonymous login prompts, save/reload persistence, the saved page, failed-unsave recovery, removal and responsive mobile layout. Hosted saving remains a manual check after applying the migration. No real account favorites were created by automated tests.
