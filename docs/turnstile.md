# Turnstile email authentication

Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in your local environment to show the widget
on Login and Signup. Restart the development server after changing it. Leaving
the key blank preserves the existing email authentication flow.

For local UI testing while Supabase CAPTCHA is disabled, use Cloudflare's
documented dummy site keys:
https://developers.cloudflare.com/turnstile/troubleshooting/testing/

Verify successful completion enables submission, expiration/error clears the
token, retry starts a new challenge, and a failed email attempt requires a fresh
token. Test at 320px width and navigate between Login and Signup. Google OAuth
has its own independent button and action.

The app forwards captchaToken through Supabase Auth options. Supabase must be
configured separately to enforce actual CAPTCHA verification. UI checks and
token presence alone cannot prove a human solved a challenge. Dummy keys are for
local testing only. No Supabase settings are changed by this integration.

Only the public site key belongs in this app. Configure the matching secret
exclusively in Supabase Auth when enabling CAPTCHA. Never commit the secret or
prefix it with NEXT_PUBLIC_. No Turnstile secret is needed in the frontend.

Automated tests verify token forwarding on login/signup and reject missing or
oversized tokens before Auth calls when the widget is configured. Live widget
behavior requires a browser and an appropriate site/test key.
