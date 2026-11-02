# Marketplace safety

Apply `supabase/migrations/202611030010_marketplace_safety.sql` after 001–009 before deploying. No dependencies or Next.js configuration changes are required.

## User flows

- Real listing details and conversations expose Safety tools after authentication. Self-controls are hidden. Listing reports accept one of five reasons and optional text up to 1,000 Unicode characters; duplicate reports return the same report. Up to ten new reports per user per hour, serialized in SQL.
- `/account/safety` shows your latest 100 report statuses and up to 500 blocked users. Report content is not exposed to sellers or other users. Reporting alone never automatically hides an item.
- Block confirmation is explicit. Blocking prevents starting chats or sending new messages in either direction, including existing conversations. Existing messages remain readable; public listings remain visible. Unblocking removes only your own block, so messaging remains disabled if the other person has blocked you. A send already in progress before a block commits can finish.
- SQL RPCs enforce blocking even if a caller bypasses the UI. A chat already open on another device updates its state on navigation/refresh and refuses any blocked send at the database. No broadcast of private block lists is used.

## Moderator setup

Moderator membership is a private table with no client read/write grants. There is no automatic first-admin assignment, public signup role, or trust in user metadata.

A project owner can grant one known account access in Supabase SQL Editor:

```sql
insert into public.moderators(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID')
on conflict do nothing;
```

Obtain the UUID from Authentication → Users; never use a password, email address or Supabase project ID in its place. To revoke, delete that specific membership in trusted SQL.

The moderator then opens `/account/safety` → Open moderation queue, or `/moderation`. Unauthorized logged-in users receive a not-found page; RPCs independently reject unauthorized calls. No moderator is created by this migration.

The queue shows the oldest 100 open reports. Dismiss leaves the listing unchanged; Hide listing requires confirmation, stores reviewer/timestamp, marks the report reviewed and removes the item from public feed/photos. The `moderated_at` flag prevents an owner from restoring it with direct updates. Existing conversations remain readable. Accounts are not banned/deleted; appeals and moderator restoration are future work. Privileged project owners can still administer data through trusted SQL.

## Validation and rollout

Disposable PostgreSQL tests cover own-report privacy, deduplication, reasons/size/rate limits, both blocking directions, old message history, unblock, self-block denial, private helper access, role spoofing/elevation denial, unauthorized moderator access, review state and owner restore denial. Existing chat/read suites run again after migration 010.

Production migration, explicit moderator assignment and a hosted two-account smoke test are owner follow-up steps; automated tests never contact real users or change real user data.

Browser validation used isolated Auth/REST/storage fixtures: failure-preserving report form, submitted/open status, non-moderator denial, block and disabled composer, readable old messages, account unblock, confirmed moderator removal, reviewed reporter status and revoked-role denial. Mobile and desktop screens were inspected; widths 320, 390, 680, 1024 and 1440px were checked for overflow. No real user messages or reports were created.

Final checks: ESLint, TypeScript, production build, all 25 Node tests and all ten disposable SQL suites passed. No production moderator membership was assigned.
