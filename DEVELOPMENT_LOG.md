# Development log

## 2026-11-02 — Listing detail pages

Built on merged homepage commit 4f2bfbb, using branch `codex/listing-details`.

- Added direct `/listings/[id]` routes for eight sample listings, with item-specific metadata.
- Cards now navigate through Next Link instead of opening the old detail modal.
- Details show the existing photo, KRW price, condition, description, category, neighborhood, sample seller and pickup guidance.
- Added an accessible enlarged-photo dialog and contact-seller demo dialog. Each sample currently has one photo; no duplicate images or invented photo angles were added.
- Favorites share in-memory state across homepage/detail navigation; reloading clears them.
- Added loading, retry and invalid-ID recovery states.
- Kept Next.js configuration, dependencies and Supabase unchanged.

Validation: `npm run lint` and `npm run build` passed. Browser checks cover card navigation, direct routes, shared favorites, image loading, modal keyboard dismissal/focus restoration and responsive widths.

Remaining: sample-only content; authentication, real messaging and database persistence are not connected. Loading/error boundaries exist but have no live backend failure to exercise.

Next task: roadmap phase 3 — Supabase schema/migrations, authentication and RLS, once backend setup is provided.

## 2026-11-02 — Supabase Auth foundation

Branch: `codex/supabase-auth`, based on merged listing-detail work.

- Added official Supabase SSR/client dependencies, ignored local configuration and a public environment template.
- Connected email signup, login, logout, PKCE callback and optional token-hash confirmation.
- Added private account UI and refresh proxy; authorization is rechecked server-side.
- Replaced the homepage login demo with session-aware account navigation.
- Prepared initial marketplace schema, explicit grants, ownership RLS and profile signup/backfill migration.
- Added server validation tests and rollback-only disposable-database RLS tests.
- Public hosted Auth settings are reachable; actual signup/login with a real email remains a manual check. No emails or real accounts were created by QA.
- Migration/RLS checks passed in local PostgreSQL/PGlite. The hosted migration is **not applied**: it requires SQL Editor or authenticated CLI access.
- Setup, redirect URLs, confirmation templates and verification limits are documented in `docs/supabase-setup.md`.

Next: apply the migration and configure allowed callback URLs, then verify signup/email/login with the owner's email before connecting real listings.
