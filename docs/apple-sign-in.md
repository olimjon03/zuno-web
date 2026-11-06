# Apple sign-in setup

Login and Signup show Continue with Apple beneath Google. Both use Supabase's existing cookie/PKCE client and `/auth/callback`, then `/welcome`. Google, email, CAPTCHA and password rules are unchanged. Apple OAuth creates a new account or signs into its existing Apple identity; Apple Hide My Email may use a different email from an existing Google account. Do not promise that such identities automatically merge. OAuth does not provide the user's full name; they can set their name in Edit profile.

## Operator setup required before live testing

The UI/code alone does not enable Apple authentication. No provider setting or secret was changed by this PR.

1. Use an Apple Developer account. In Certificates, Identifiers & Profiles create/configure an App ID with Sign in with Apple enabled, then a Services ID associated with that App ID (e.g. `com.yourcompany.zuno.web`; use your own identifier).
2. In that Services ID's web configuration register the Supabase domain `jkqeqsorcsarzgwxaozy.supabase.co` and Return URL `https://jkqeqsorcsarzgwxaozy.supabase.co/auth/v1/callback`. This is Apple's return to **Supabase**, not the app callback.
3. Create a Sign in with Apple signing key. Keep the `.p8` file, Team ID and Key ID securely. Generate the Apple client-secret JWT following [Supabase's official Apple guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple). Never put the `.p8` or client secret in Git, browser code, `NEXT_PUBLIC_` variables or chat.
4. In the same Supabase project, Authentication → Sign In / Providers → Apple: set the Services ID as the web Client ID (first if there are multiple IDs), enter the generated OAuth secret, enable Apple and save. No new Vercel environment variable is needed by this implementation.
5. Confirm Authentication → URL Configuration includes app redirect `https://zuno-web-wine.vercel.app/auth/callback` and the production Site URL. Preserve Google/local URLs already needed.
6. Once the PR is merged/deployed and the provider is configured, test Apple authorization on desktop and mobile, returning to `/welcome`, profile creation, logout and a second Apple sign-in. Test Google and email as regressions. Provider cancellation should return safely without exposing tokens. Use a staging Apple Services ID/Supabase project to test without changing production.
7. Rotate the Apple OAuth client secret before its expiry (Apple permits at most six months). Keep the signing key safe for renewal.

Source: [Supabase Sign in with Apple](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple), reviewed November 6, 2026. Real Apple sign-in cannot be validated until the operator configures these credentials; mocked tests only validate startup/redirect security.
