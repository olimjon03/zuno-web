# ZUNO Assistant: Gemini deployment

The assistant uses the Gemini REST API with `gemini-3.5-flash-lite` to classify
questions into approved ZUNO help topics. It displays curated translated answers,
not arbitrary model output. Authentication and the existing 20-request daily
quota remain required. No new dependencies or database migrations are needed if
migration `202611040023_zuno_assistant_quota.sql` is already applied.

## Configure

1. Create an API key in Google AI Studio for a project with access to Gemini.
2. In the **zuno-web** Vercel project, add **GEMINI_API_KEY** as a server-only
   environment variable for Production (and Preview only if needed). The value
   is the API key itself. Do not use a `NEXT_PUBLIC_` prefix or commit the key.
3. Merge the Gemini integration PR, then deploy with that environment variable.
   For local development, add the variable to `.env.local` and restart Next.js.
4. Sign in, visit `/help#zuno-assistant`, and ask how to sell an item on ZUNO.
   Test an unrelated question too: it should show the supported-topic fallback.

`OPENAI_API_KEY` is no longer read by this assistant. There is no automatic
fallback to a paid provider. Free-tier availability and limits depend on Google's
project/model settings; billing-enabled projects can incur charges. Check the
Google AI Studio project tier before use.

The form tells users that Google Gemini processes their question. On Google's
free tier, submitted content may be used to improve its products. Do not send
passwords or private details. ZUNO does not send profiles or chat history.

## Diagnose

Vercel logs use `[zuno-assistant] Gemini request failed` with the HTTP status and
an allowlisted error status only. `RESOURCE_EXHAUSTED` (429) indicates a quota or
rate limit; `PERMISSION_DENIED` (403) indicates access restrictions;
`INVALID_ARGUMENT` (400) can include an invalid key or request configuration.
Check the project's key, API/model access and limits without exposing secrets.
The UI continues to offer help topics if the key is absent or a request fails.

## References

- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/api/generate-content
