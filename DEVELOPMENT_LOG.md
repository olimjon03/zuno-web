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

## 2026-11-02 — Google sign-in

Branch: `codex/google-login`.

- Added accessible Google sign-in buttons to login and signup while retaining email/password.
- Added an SSR OAuth server action, fixed app callback destination and generic cancellation/error handling.
- Added Google name fallback on the protected account screen.
- Hosted Google provider and read-only Google handoff verified. Browser tests cover both forms, PKCE parameters/cookie, keyboard activation, cancellation, responsive layouts and email validation.
- Lint, build and the four existing auth validation tests pass. Actual Google account consent/session is left to the owner; automation did not sign in to an account.
- No credentials, dependency changes, migrations or Next.js configuration changes in this branch.


## 2026-11-02 — Return to marketplace after login

Successful password login/signup and Google/email confirmation now navigate to `/` instead of `/account`. The Account header link still opens the protected profile page. Logout and failed-login routes remain the same.

## 2026-11-02 — Listing creation and private photos

Branch: `codex/create-listings`.

Added authenticated `/sell`, bounded upload API, image normalization, private Storage policies and atomic/idempotent publishing RPC. Homepage and detail pages read live listings with labelled sample fallback. New reusable form/gallery components support mobile layouts. Added `sharp` directly for safe decoding; Next configuration remains unchanged.

Validation: eight Node tests, lint, build, disposable PostgreSQL RLS/storage-policy tests and fixture-backed browser checks. Hosted second migration and real hosted publishing remain pending owner SQL Editor setup; see `docs/listing-setup.md`.

## 2026-11-02 — Owner listing management

Branch: `codex/manage-listings`. Added protected `/account/listings` and reusable management forms with validated server actions. Owners can edit item details, mark sold/available and confirm removal. Removal hides items/photos while retaining private storage; photo replacement and permanent deletion are not included. Account now links to management, and marketplace cards/details display sold/reserved labels. No new dependencies, Next configuration changes or migrations.

Validation: lint, build, eight existing Node tests, extended PostgreSQL ownership/privacy tests and fixture-backed browser checks including failure recovery and responsive layouts. Real hosted listings were not changed by tests.

## 2026-11-02 — Persistent saved items

Branch: `codex/saved-items`. Added account-owned favorites migration and RLS, authenticated server reads/writes, shared persistent heart state and `/account/saved`. Saves require login, duplicate inserts are ignored, errors preserve the existing state, and removed listings are omitted. Sample favorites stay in memory. No dependencies or Next configuration changes.

Lint/build, eight existing Node tests, disposable PostgreSQL privacy/ownership tests and local fixture browser save/reload/unsave checks passed. The new hosted migration is pending SQL Editor execution by the owner; setup is in `docs/saved-items.md`.
