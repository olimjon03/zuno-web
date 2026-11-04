# Header language and notification controls

The language selector now uses the selected outline globe icon, with the same 40px target, teal color, 23px icon size and 1.8px stroke as the adjacent notification bell. Country-specific language choices, fixed language names/flags and stored preference remain. The icon menu supports arrow keys, Home/End, Enter/Space, Escape, outside-click dismissal and focus return. It also works on Welcome and inside Language & appearance dialogs.

`HeaderTools` places the globe and bell together on the homepage and desktop account header. Fixed popover positioning clamps both panels within the viewport, including at 320px. Existing navigation, profile/menu icons, listing categories and the floating sell button remain.

## Real notification sources

The notification panel has two sections:

- **Messages:** current unread conversations from the existing RLS-protected get_inbox/get_unread_counts functions. Clicking opens the actual conversation. Message read state stays with the existing chat flow.
- **From ZUNO:** durable private website notifications. Listing moderation creates an alert for its owner, and report review creates an alert for its reporter. Trusted backend/service-role code can also insert announcement rows. The website section can be marked read individually or in full; this does not mark chats read.

The bell's red count combines unread messages and website notifications, capped visually at 99+. Site snapshots return the latest 20 rows plus the full unread count, including older rows; mark-all covers the entire recipient's unread website alerts. User-generated titles/message previews and announcement bodies retain their original language; interface labels and standard system titles support all five languages.

One root NotificationsProvider subscribes to recipient-filtered Realtime changes, coalesces refreshes, reconciles on focus/visibility, polls every 30 seconds without Realtime and audits at 60 seconds while connected. Message events reuse the existing root unread provider rather than adding another message subscription. Signing out or switching identities clears cached alerts and invalidates old responses. Write RPCs include the expected user identity so an action started for an old session cannot mark a new session's alerts read.

Guest users see a sign-in action. Fetch/read failures show retry or error states without claiming success. If website notifications are unavailable, the message section continues to work. No browser push permission is requested; these are in-app notifications.

## Database rollout

Apply **supabase/migrations/202611040018_notifications.sql once after migration 017** using the project's SQL Editor or normal migration deployment. It has not been applied to the hosted project by Codex.

The migration creates a private notifications table, recipient-only SELECT policy, a bounded read RPC and an owner/expected-identity-checked mark-read RPC. Authenticated clients cannot insert, edit or delete alerts directly. Moderation/report triggers execute with a fixed empty search path. The table is added to the existing Realtime publication when available. Existing moderation roles and permissions remain.

Trusted SQL or backend code may publish a website announcement, replacing the recipient placeholder with a real auth.users ID:

```sql
insert into public.notifications(user_id,kind,title,body,href)
values ('USER_UUID'::uuid,'announcement','ZUNO update','Your announcement text','/help');
```

Only supported local destinations are rendered as links; invalid destinations fall back to /account. No service key belongs in the browser. The migrations need no additional packages or framework configuration.

## Files and verification

- `src/features/language/language-selector.*`: accessible globe menu.
- `src/components/ui/use-icon-popover.ts`: shared positioning, dismissal and focus behavior.
- `src/components/layout/header-tools.*`: adjacent icon placement.
- `src/features/notifications/`: payload/link validation, private root provider and notification panel.
- `supabase/migrations/202611040018_notifications.sql`, `supabase/tests/notifications.sql`: storage, producers and security checks.

76 Node tests pass, including new malicious-link, malformed-payload, bounded-row and unread-message parser checks. ESLint, TypeScript and production build are checked. The migration and SQL tests ran in a disposable PostgreSQL/PGlite database with prior migrations/regressions: anonymous/other-user denial, forbidden client forgery, stale-session guard, idempotent reads, trigger recipients/duplicates and exact unread totals beyond the 20-item page all pass. Existing moderation/report/block tests also pass with the new triggers installed.

Playwright Chromium with disposable fixture data verified guest sign-in prompts, language keyboard selection/focus return, UZ choices, live incoming chat and website alerts, combined badge counts, failed mark-read/retry, notification service outage with chat still visible, account/header rendering and privacy cleanup after logout. Responsive popover checks cover 320/390/768/1440px without horizontal overflow. Header and panel screenshots were visually inspected against the existing teal line-icon system.
