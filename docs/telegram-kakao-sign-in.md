# Telegram and Kakao login

Login/Signup offer Google, Telegram and Kakao, followed by email. Apple is not included. The Google flow is unchanged. Both new providers use Supabase Auth's existing cookie/PKCE session and app `/auth/callback` → `/welcome`. Telegram uses a **Custom OAuth/OIDC provider**, not Third-Party Auth and not unverified Telegram widget data. Supabase creates its usual UUID user; existing profile/member-number creation remains in place. Neither client secrets nor bot tokens belong in frontend/Vercel public variables or Git.

**Operator setup is required.** This PR does not enable/configure production providers or create external applications. Until configured, live sign-in through those providers is unavailable. No SQL migration or new app environment variable is required.

## Telegram

1. Create a ZUNO bot through the verified Telegram `@BotFather` bot. In its mini app select your bot → Login Widget → OpenID Connect Login, and obtain the Login Client ID and Client Secret. These are OIDC credentials, not the Bot API token.
2. Supabase → Authentication → Sign In / Providers → Custom Providers → New Provider → Auto-discovery (OIDC). Set identifier **`custom:telegram`**, name Telegram, issuer `https://oauth.telegram.org`, and enter those OIDC credentials. Use scopes `openid profile`; enable **Allow users without an email** (`email_optional: true`). Keep PKCE and nonce verification enabled. Do not request phone or bot messaging permission for basic login.
3. Copy the callback URL displayed by Supabase and register that **exact** URL under BotFather Allowed URLs/Redirect URIs before completing setup. For the default project Auth domain it should be `https://jkqeqsorcsarzgwxaozy.supabase.co/auth/v1/callback`; use the displayed value if Supabase specifies another URL. Enable/save the provider.
4. Preserve the app redirect allow-list `https://zuno-web-wine.vercel.app/auth/callback`. This is the later Supabase→ZUNO callback, separate from Telegram→Supabase.

Telegram supplies no email. Do not fabricate an email or try to link accounts by display name/username. Users can add a real email in profile settings if desired. Telegram name/photo claims may not fill every existing profile field; Edit profile remains available. A different provider identity may create a separate ZUNO account.

Sources: [Telegram Login](https://core.telegram.org/bots/telegram-login), [Supabase custom OAuth/OIDC](https://supabase.com/docs/guides/auth/custom-oauth-providers), [Supabase Telegram example](https://supabase.com/docs/guides/self-hosting/self-hosted-custom-oauth-providers#example-telegram). The latter's protocol example applies here; do not run its self-hosted Docker configuration against the hosted project.

## Kakao

1. Create a ZUNO application in [Kakao Developers](https://developers.kakao.com/). Configure its web platform/domain for `https://zuno-web-wine.vercel.app` and enable Kakao Login.
2. Register the Supabase callback `https://jkqeqsorcsarzgwxaozy.supabase.co/auth/v1/callback` as the Kakao Login redirect URI (confirm it in Supabase).
3. Obtain the **REST API key** (client ID) and Kakao Login **Client Secret**. Supabase → Authentication → Sign In / Providers → Kakao: enter them and enable/save the provider. Do not use the JavaScript key as the REST API key.
4. Configure permitted profile consent items. If requesting account email, enable the applicable consent item in Kakao (availability may depend on app status). Otherwise enable **Allow users without an email** in Supabase Kakao settings; do not force an email scope your app is not permitted to request.
5. Keep the same app `/auth/callback` in Supabase redirect URLs. No Kakao secret needs to be added to browser code.

Source: [Supabase Kakao setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-kakao).

## Verification after setup

Use staging credentials/project first. Confirm new-account creation, existing-provider login, `/welcome`, profile/member number, logout and repeated login on mobile/desktop for each provider. Test denial/cancellation and Google/email regressions. Mocked action tests cover startup redirects and error privacy, not provider consent/token exchange. Until real configured-provider testing succeeds, do not call this integration fully verified.
