# Supabase authentication setup

## What is implemented

Email/password signup, login, local logout, PKCE email callback, optional token-hash email confirmation, and a protected `/account` page are connected to Supabase Auth. The homepage navigation changes to Account when a browser session exists. Protected server content independently calls `auth.getUser()`; browser state is never used for authorization. `src/proxy.ts` refreshes cookies on auth/account routes with `getClaims()` and marks those responses private/no-store. Dynamic account content is behind Suspense to preserve the existing Cache Components configuration.

The account page displays Auth's email and display name. Database-backed profile editing remains future work. Real listing creation and photos are described in [listing-setup.md](listing-setup.md); favorites and seller contact remain demo behavior.

## Local environment

Copy `.env.example` to `.env.local` and fill in your own project URL and publishable key. The supplied ZUNO project values were saved only to the ignored `.env.local`; they are not committed. A publishable key is meant to reach the browser and does not grant schema/admin access. Do not put a database password, secret key, access token or service-role key in these variables.

Set `NEXT_PUBLIC_SITE_URL` to the exact browser origin used for testing (for this checkout: `http://127.0.0.1:3000`). Use the same hostname throughout the flow because PKCE uses a verifier cookie in that browser. For deployment, set all three environment variables in the hosting provider and set the site URL to the real HTTPS origin. Restart/rebuild after changing NEXT_PUBLIC variables.

## Dashboard setup needed

In Supabase Authentication → URL Configuration:

1. Set Site URL to the intended app origin.
2. Add the exact callback to the allowed Redirect URLs: `http://127.0.0.1:3000/auth/callback` for this local checkout, plus the HTTPS production callback when deployed.
3. Keep email confirmation enabled. The standard confirmation template using `{{ .ConfirmationURL }}` works with the PKCE `/auth/callback` route in the same browser.

Optional cross-device confirmation: change the signup confirmation template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. The `/auth/confirm` handler only accepts type `email` and always navigates to the marketplace `/`. Neither callback accepts user-provided redirect destinations. Add the production configuration before sending real confirmation emails.

The project's public Auth settings were read successfully: email provider enabled, signup enabled and email confirmation required. No real accounts were created and no emails were sent during automated QA. Actual email delivery remains a manual check; provider email quotas/SMTP settings can affect it.

## Database migration needed

The publishable key cannot apply schema changes. The owner has applied the initial migration to the hosted project. For a fresh project: Open Supabase SQL Editor, paste `supabase/migrations/202611020001_initial_marketplace.sql`, and run it once on the new project. Alternatively, use an authenticated Supabase CLI migration workflow. Do not paste an admin credential into chat.

The migration creates:

- `profiles`: linked to Auth users, private to their owner, with language and optional neighborhood.
- `categories` and `neighborhoods`: readable by browsers, editable only through privileged administration.
- `listings`: constrained KRW prices, conditions and status; public active/reserved/sold listings; removed listings visible only to their owner.
- A hardened signup trigger and backfill for profiles. User-supplied display names are sanitized for database length; user metadata never grants permissions.
- Explicit grants, RLS policies, foreign keys, deletion behavior and feed/ownership indexes.

The neighborhood labels are initial browsing labels, not verified location claims. The frontend now loads database listings, with labelled samples when the feed is empty or unavailable. Apply the second migration as described in [listing-setup.md](listing-setup.md).

## Verification

- `npm run lint`
- `npm run build`
- `node --test tests/auth-validation.test.mjs` (Node 22.18+ or a compatible TypeScript-stripping Node runtime; the current Node 26 runtime emits a harmless module-type detection warning.)
- `supabase/tests/rls.sql` is for a **disposable database** with only the initial migration applied; use `listing-photos.sql` after both migrations. It rolls back fixture rows and tests anonymous visibility, private profiles, ownership enforcement, forged inserts, protected category writes and owner changes. Do not run fixtures against a live marketplace.

The migration and RLS suite passed locally under temporary PGlite/PostgreSQL with Supabase Auth schema/roles stubbed; no new test package was added to the project. This is not a substitute for checking hosted policies after applying the migration.

Playwright checks cover anonymous route denial, invalid confirmation recovery, redirect safety, native and server validation, and responsive auth forms. A separate local Auth fixture verified successful login, account access, reload persistence, header state, signup's email-confirmation state, token-hash confirmation and logout. This fixture does not prove real provider delivery or hosted session behavior. Finish with your own email: sign up, click the confirmation link, log in, reload `/account`, and log out.

Dependency audit: no new Supabase production advisory was identified; npm reported moderate minimatch advisories through the existing ESLint development dependency tree. No forced dependency downgrades were applied.

Official reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client

## Google sign-in

Both `/login` and `/signup` include a separate “Continue with Google” form. Its server action uses the official SSR client to generate a PKCE verifier cookie and hand the browser to the configured Supabase `/auth/v1/authorize` endpoint. Email fields are not required for this flow. The Google request includes `prompt=select_account` so Google asks the user to choose an account instead of silently reusing the previous one. The available accounts depend on the current browser’s Google sessions; without a session Google asks the user to sign in. No Google SDK or new dependency was added.

The Google provider must be enabled in Supabase. Keep the OAuth Client Secret only in the Supabase dashboard. The Google Cloud Web client must allow the hosted Supabase `/auth/v1/callback` as its redirect URI; Supabase must allow the app's `/auth/callback`. These are two different callback endpoints. The app continues using the existing configured `NEXT_PUBLIC_SITE_URL` origin.

The shared app callback exchanges the code for a Supabase session and opens the marketplace `/`. Cancellation and exchange failures go to a generic sign-in notice, with no provider message or arbitrary redirect reflected. The account screen can display Google's `full_name` or `name` when `display_name` is absent. Database profiles still use the existing signup trigger/default and can be extended with profile editing later.

Verification: hosted Auth settings show Google enabled; a read-only authorization request returned a Google redirect with the expected Supabase callback. Playwright intercepted the external handoff from both auth pages and checked provider, app callback, S256 challenge, verifier cookie, keyboard activation, cancellation recovery, email fallback and mobile widths. A real account selection/consent remains a user check in Google. If Google reports `access_denied` while the OAuth app is in Testing, check the Google Auth Platform Audience/test-user settings for the chosen account.

Reference: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

Successful email/password login, an immediately confirmed signup, and both email/OAuth confirmation callbacks now land on the marketplace `/`. The signed-in header links to `/account`, which remains protected.

## Vercel Google sign-in startup failure

The deployed `zuno-web-wine.vercel.app` login reproduced the generic Google startup error. Public loaded browser chunks still contained unresolved reads of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, unlike the working local build. This indicates those public variables were absent at build time; the ignored local `.env.local` is not deployed. The production environment was not changed by automation because no Vercel project-management connection is available.

In Vercel → Project Settings → Environment Variables, configure Production:

- `NEXT_PUBLIC_SUPABASE_URL`: the same Supabase project URL as local `.env.local`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the same publishable key as local `.env.local` (never a service-role key).
- `NEXT_PUBLIC_SITE_URL`: `https://zuno-web-wine.vercel.app`.

Redeploy after saving; Next public values are embedded during build. In Supabase Authentication → URL Configuration, set the production Site URL to `https://zuno-web-wine.vercel.app` and allow `https://zuno-web-wine.vercel.app/auth/callback`. Retain the existing local callback for local testing. Google Cloud's OAuth redirect stays the Supabase `/auth/v1/callback` URL, not the ZUNO URL.

As a fallback when explicit site configuration is absent, the app now derives HTTPS origins from trusted Vercel system environment variables: production uses `VERCEL_PROJECT_PRODUCTION_URL`, previews use `VERCEL_URL`. Preview callbacks must be separately allowlisted to use preview login. Request Host headers are never used. Explicit site configuration remains preferred and takes precedence. This fallback does not replace the required Supabase URL/key.

References: https://vercel.com/docs/environment-variables/system-environment-variables and https://vercel.com/docs/environment-variables.
