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

## Kakao — no-email OIDC setup (replaces built-in Kakao)

The built-in Kakao adapter automatically requests `account_email`. Enabling Email optional changes callback acceptance, not those requested scopes. For apps with Unauthorized email consent / KOE205, use **custom:kakao** instead. Adding SDK `scopes` to the built-in adapter is not a fix: that adapter appends its defaults. This branch intentionally changes the Kakao button to `custom:kakao`; configure it before testing/deploying.

1. Keep your existing ZUNO app, REST API key and active Kakao Login Client Secret in [Kakao Developers](https://developers.kakao.com/). Under Kakao Login enable both **Kakao Login** and **OpenID Connect**. Profile nickname/image consent items should remain configured; email consent is not required for this flow.
2. Supabase → Authentication → Sign In / Providers → Custom Providers → New Provider → **Auto-discovery (OIDC)**. Configure:

   | Field | Value |
   | --- | --- |
   | Identifier | `custom:kakao` |
   | Name | `Kakao` |
   | Issuer | `https://kauth.kakao.com` |
   | Client ID | Your existing Kakao **REST API key** |
   | Client Secret | Your existing Kakao Login **Client Secret** |
   | Scopes | Exactly `openid`, `profile_nickname`, `profile_image` |
   | Allow users without an email / email_optional | **ON / true** |
   | PKCE | **ON** |
   | Skip nonce check | **OFF** |

   Remove any default `email`, `account_email` or generic `profile` scope from this custom provider. Scope-entry UI may show separate chips; enter the three scope names separately. Kakao uses the two profile-specific scope names, not generic `profile`.
3. Copy the custom provider's displayed Callback URL into Kakao's **App → Platform Key → REST API key → Redirect URI** and save. On the default project domain it should be `https://jkqeqsorcsarzgwxaozy.supabase.co/auth/v1/callback`; the displayed custom-provider URL is authoritative.
4. Create/enable/save the custom provider. Keep `https://zuno-web-wine.vercel.app/auth/callback` in Supabase's app redirect allow-list. No new Vercel variable or SQL is needed; secrets stay in Supabase.
5. Merge/deploy this code and start a **new** Continue with Kakao attempt from ZUNO, not the previously failed browser URL. Confirm the Kakao authorization request contains only `openid profile_nickname profile_image` and no `account_email`. Complete consent, confirm `/welcome`, profile/member number, logout and repeated sign-in.

Creating the custom provider is not performed by this code. Live authentication remains unverified until operator setup. If the built-in Kakao provider already has users, treat the new custom provider as a different identity namespace: do not assume existing accounts will be linked, and plan a verified identity migration first. Do not disable/delete old provider identities as a cleanup shortcut. Google and Telegram are unchanged.

Sources: [Kakao OIDC endpoints and claims](https://developers.kakao.com/docs/en/kakaologin/rest-api), [Supabase custom OAuth/OIDC settings](https://supabase.com/docs/guides/auth/custom-oauth-providers), [built-in Kakao adapter defaults](https://github.com/supabase/auth/blob/master/internal/api/provider/kakao.go). Reviewed November 7, 2026. Public Kakao discovery verified issuer `https://kauth.kakao.com`, token method `client_secret_post`, RS256 and S256 PKCE support; this is discovery verification, not a completed real-user login.

## Verification after setup

Use staging credentials/project first. Confirm new-account creation, existing-provider login, `/welcome`, profile/member number, logout and repeated login on mobile/desktop for each provider. Test denial/cancellation and Google/email regressions. Mocked action tests cover startup redirects and error privacy, not provider consent/token exchange. Until real configured-provider testing succeeds, do not call this integration fully verified.
