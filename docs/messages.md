# Marketplace chat

Apply `supabase/migrations/202611020004_messages.sql` in SQL Editor after the first three migrations. This migration has not been applied to the hosted project by automation. It creates conversations, messages and two restricted RPCs. No new dependencies, environment variables or Realtime publication setup are required.

Contact seller on a real active/reserved listing starts or reopens a unique buyer/listing conversation. Authentication is required and self-chat is rejected. Account → Messages lists up to the latest 100 conversations. Open conversations fetch new messages every five seconds while the tab is visible. They initially load the latest 50 messages and offer Load older messages. This phase uses polling; it does not provide push notifications, sender-facing read receipts, typing indicators, attachments, blocking/reporting or message editing/deletion.

All reads recheck Auth and rely on participant-only database RLS. Clients cannot insert/update conversation participants or message senders. Security-definer RPCs derive the actor from Auth, use an empty search path and enforce participation. Text is plain text, rendered by React; messages are limited to 2,000 characters. Stable client submission IDs make retries idempotent. Sends lock their conversation before assigning message IDs so concurrent commits preserve cursor order. Failed sends retain drafts and errors are shown accessibly.

Conversation titles and display names are snapshots and contain no account email. Existing participants retain their conversation and can continue messaging after the item is removed; new buyers cannot start a conversation for removed/sold items. Permanent listing deletion preserves an existing conversation's title but clears its item link. Account deletion cascades chat records through Auth foreign keys. This is ordinary authenticated stored messaging, not end-to-end encryption.

Validation: `npm run lint`, `npm run build`, `node --test tests/*.test.mjs` (Node 26 in this environment; the chat test uses Node module resolution hooks). `supabase/tests/messages.sql` runs only in a disposable database after all migrations and rolls back fixtures. It checks both participants, stranger and anonymous denial, self-chat, duplicate conversation/message retries, forged direct inserts, blank/oversized messages and removed-item behavior. A temporary PGlite harness passed these and prior RLS suites without adding dependencies.

Local Playwright Auth/REST fixtures cover login gating, opening chat, sending, receiving a polled seller reply, retaining/retrying a failed send, history pagination, inbox navigation, reload and widths 320/390/768/1440. No real user was contacted. After applying the hosted migration, test using two accounts in separate browser sessions: one owns an item, the other contacts the seller, then each sends a message. A third account should not be able to open the copied conversation URL.

Unread account/inbox badges and private read-state tracking are now described in [unread-messages.md](unread-messages.md), with a separate fifth migration.

Realtime delivery now supplements polling; see [realtime-messages.md](realtime-messages.md) for the sixth migration and connection behavior.
