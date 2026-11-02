# Supabase authentication setup

## What is implemented

Email/password signup, login, local logout, PKCE email callback, optional token-hash email confirmation, and a protected `/account` page are connected to Supabase Auth. The homepage navigation changes to Account when a browser session exists. Protected server content independently calls `auth.getUser()`; browser state is never used for authorization. `src/proxy.ts` refreshes cookies on auth/account routes with `getClaims()` and marks those responses private/no-store. Dynamic account content is behind Suspense to preserve the existing Cache Components configuration.

The account page displays Auth's email and display name. Database-backed profile editing and real marketplace listings are later work. Browsing, favorites and seller contact remain demo behavior.

## Local environment

Copy `.env.example` to `.env.local` and fill in your own project URL and publishable key. The supplied ZUNO project values were saved only to the ignored `.env.local`; they are not committed. A publishable key is meant to reach the browser and does not grant schema/admin access. Do not put a database password, secret key, access token or service-role key in these variables.

Set `NEXT_PUBLIC_SITE_URL` to the exact browser origin used for testing (for this checkout: `http://127.0.0.1:3000`). Use the same hostname throughout the flow because PKCE uses a verifier cookie in that browser. For deployment, set all three environment variables in the hosting provider and set the site URL to the real HTTPS origin. Restart/rebuild after changing NEXT_PUBLIC variables.

## Dashboard setup needed

In Supabase Authentication → URL Configuration:

1. Set Site URL to the intended app origin.
2. Add the exact callback to the allowed Redirect URLs: `http://127.0.0.1:3000/auth/callback` for this local checkout, plus the HTTPS production callback when deployed.
3. Keep email confirmation enabled. The standard confirmation template using `{{ .ConfirmationURL }}` works with the PKCE `/auth/callback` route in the same browser.

Optional cross-device confirmation: change the signup confirmation template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. The `/auth/confirm` handler only accepts type `email` and always navigates to `/account`. Neither callback accepts user-provided redirect destinations. Add the production configuration before sending real confirmation emails.

The project's public Auth settings were read successfully: email provider enabled, signup enabled and email confirmation required. No real accounts were created and no emails were sent during automated QA. Actual email delivery remains a manual check; provider email quotas/SMTP settings can affect it.

## Database migration needed

The publishable key cannot apply schema changes. **The migration has not been run against the hosted project.** Open Supabase SQL Editor, paste `supabase/migrations/202611020001_initial_marketplace.sql`, and run it once on the new project. Alternatively, use an authenticated Supabase CLI migration workflow. Do not paste an admin credential into chat.

The migration creates:

- `profiles`: linked to Auth users, private to their owner, with language and optional neighborhood.
- `categories` and `neighborhoods`: readable by browsers, editable only through privileged administration.
- `listings`: constrained KRW prices, conditions and status; public active/reserved/sold listings; removed listings visible only to their owner.
- A hardened signup trigger and backfill for profiles. User-supplied display names are sanitized for database length; user metadata never grants permissions.
- Explicit grants, RLS policies, foreign keys, deletion behavior and feed/ownership indexes.

The neighborhood labels are initial browsing labels, not verified location claims. The frontend intentionally keeps using sample listings until the listing workflow phase.

## Verification

- `npm run lint`
- `npm run build`
- `node --test tests/auth-validation.test.mjs` (Node 22.18+ or a compatible TypeScript-stripping Node runtime; the current Node 26 runtime emits a harmless module-type detection warning.)
- `supabase/tests/rls.sql` is for a **disposable database** with the migration applied. It rolls back fixture rows and tests anonymous visibility, private profiles, ownership enforcement, forged inserts, protected category writes and owner changes. Do not run fixtures against a live marketplace.

The migration and RLS suite passed locally under temporary PGlite/PostgreSQL with Supabase Auth schema/roles stubbed; no new test package was added to the project. This is not a substitute for checking hosted policies after applying the migration.

Playwright checks cover anonymous route denial, invalid confirmation recovery, redirect safety, native and server validation, and responsive auth forms. A separate local Auth fixture verified successful login, account access, reload persistence, header state, signup's email-confirmation state, token-hash confirmation and logout. This fixture does not prove real provider delivery or hosted session behavior. Finish with your own email: sign up, click the confirmation link, log in, reload `/account`, and log out.

Dependency audit: no new Supabase production advisory was identified; npm reported moderate minimatch advisories through the existing ESLint development dependency tree. No forced dependency downgrades were applied.

Official reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client
