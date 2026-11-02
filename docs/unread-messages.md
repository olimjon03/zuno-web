# Unread message badges

Apply `supabase/migrations/202611020005_message_reads.sql` after the four existing migrations in Supabase SQL Editor. The hosted migration is pending owner execution. No dependency or environment changes are needed. Until the migration exists, chat sending/history still work; badges are hidden and the chat reports that read status could not be saved.

Unread counts appear beside Account on the marketplace, Messages in Account and each conversation in the inbox. Counts refresh every ten seconds while the document is visible, after navigation/focus/auth changes and after marking messages read. They count incoming messages only and cap the displayed badge at 99+. This is in-app polling, not push notifications.

Opening a visible conversation marks only the newest message already loaded into that chat as read. Newly fetched messages are marked as they render. Hidden tabs do not poll or acknowledge messages. The read cursor is monotonic: stale requests cannot move it backwards, and an arriving message beyond the acknowledged ID stays unread. Read markers are private to their user; this phase does not show sender-facing read receipts. Failed acknowledgements retain an explanatory status and retry every fifteen seconds while visible. The inbox list still shows its latest 100 conversations; the total badge covers all conversations with unread messages.

Database reads use RLS; both RPCs are available only to authenticated users. The write RPC verifies conversation participation, derives the user ID from Auth and accepts only an existing message ID in that conversation. Direct client writes to cursors are revoked. The counts function is security-invoker and cannot bypass RLS.

Verification: lint, production build, ten Node tests, and all prior SQL suites plus `supabase/tests/message-reads.sql` in disposable PostgreSQL/PGlite. SQL tests cover incoming/own messages, participant isolation, stranger and anonymous denial, forged direct writes, future cursors, stale acknowledgements and later messages. Fixtures roll back and must not run against the hosted marketplace.

Local Playwright fixtures cover inbox/header badges, opening a chat clearing unread state and hidden/visible document behavior. Real two-account hosted behavior should be checked after applying the migration: send from the other account, wait up to ten seconds, open the receiving conversation and confirm the badge clears. Automated QA does not send real user messages.

Realtime events now trigger immediate updates, while the ten-second interval remains reconciliation. See [realtime-messages.md](realtime-messages.md) for the required sixth migration.
