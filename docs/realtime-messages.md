# Realtime marketplace messaging

Apply `supabase/migrations/202611020006_realtime_messages.sql` after the five previous migrations in Supabase SQL Editor. It adds `messages` and `message_reads` to `supabase_realtime`, creating that publication only if absent. It preserves existing publication tables and can be run again safely. The hosted migration is pending owner execution. No new package, environment variable or Next configuration is needed.

The existing Supabase browser client opens one account-scoped Postgres Changes channel. It listens for message INSERTs allowed by participant RLS and the current user's read-cursor INSERT/UPDATEs. On a message event the chat immediately refetches authorized messages and unread counts; the inbox also refreshes. On a read-cursor event counts refresh, including reads made in another browser session. Payloads trigger refetches rather than being trusted as the UI's authoritative message state. Direct writes still use the protected server actions and RPCs.

Auth changes remove the prior channel, clear counts and bind the current access token before subscribing. Cleanup ignores late callbacks from removed channels. Reconnection triggers a server refresh to catch missed messages. Refresh queues coalesce event bursts and guarantee a trailing fetch if an event arrives during another fetch. Message IDs remain deduplicated in the message history. Drafts are retained across connection changes.

Realtime is the immediate path. Periodic reconciliation remains at five seconds for an open chat and ten seconds for unread counts, covering network loss, missed events and a disabled publication. Hidden documents do not fetch/acknowledge; visibility/focus refreshes catch up. WebSocket subscriptions can remain connected while hidden, and are removed on logout or provider cleanup. Live chat shows connection status. Read acknowledgements no longer repeat after the same loaded cursor was confirmed.

This is not push notification delivery while the site is closed, nor a fixed latency guarantee. Sender-facing read receipts, attachments and typing indicators remain future work. The SELECT policies still authorize each INSERT/UPDATE delivery; no anonymous read grants, DELETE handlers or full replica identity were added.

## Verification

- `npm run lint`, `npm run build`, and `node --test tests/*.test.mjs` (13 tests).
- The temporary PGlite harness applies the publication migration twice, verifies publication membership/RLS/grants and reruns the participant/read-cursor privacy suites after it. `supabase/tests/realtime-messages.sql` is for a disposable database, not a live marketplace. PGlite does not test hosted Realtime delivery.
- Local browser fixtures implement the installed SDK's Phoenix/WebSocket protocol. They cover live subscription, immediate incoming messages/counts, another-session read changes, fallback on socket loss, reconnect, draft retention and responsive widths. These are isolated synthetic accounts, not real user messages.

After migration and deployment, use two real accounts in separate sessions. Keep the receiving inbox/chat open, send from the other account and check that the new message/badge appears without waiting for the reconciliation interval. Read it in another session of the receiving account and verify counts clear. Copying the conversation URL to a third account must remain denied. Hosted delivery and two-account behavior remain owner checks.

Primary references: [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes), [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization), and [publication troubleshooting](https://supabase.com/kb/troubleshooting/realtime-postgres-changes-troubleshooting).
