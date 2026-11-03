# Navigation performance and section controls

Root causes found: UnreadProvider and FavoritesProvider rebuilt their auth subscriptions on every pathname change. This reset saved state and tore down/recreated the Realtime channel. Background reads used Server Actions, which Next dispatches sequentially in the browser. The local site on port 3000 also ran `next dev` from a separate checkout (`/Users/tojiboevolimjon/Projects/zuno-web`), so this workspace's changes were not the running site and cold visits included development compilation.

Changes: providers stay mounted across navigation and suppress redundant same-user auth events. Saved IDs and unread RPC results load directly with the browser Supabase client under existing RLS; writes remain verified server actions. A route observer reconciles local Auth cookies for server login/logout without reconnecting the same user. Token refresh updates Realtime auth, and account switches clear state and reject stale reads. Healthy Realtime uses 60-second reconciliation; disconnected mode keeps the 10-second fallback. Signed-out/hidden documents do not fetch unread data. A hydration snapshot helper keeps delayed streamed boundaries consistent when browser data arrives first.

BackHomeNav appears across account, settings, own/saved listings, live/sample listing details, neighbors, selling, inbox/conversations, login/signup, help, missing/error pages and loading shell. Future-feature/photo preview dialogs use Back to dismiss the current overlay, and Home closes it and returns to the marketplace. All controls have accessible labels. Existing per-page secondary links were replaced by the shared controls; the home marketplace itself does not need a back-to-home toolbar.

Validation with Playwright Chromium (Browser/IAB automation unavailable), isolated local Auth/REST/Storage/Realtime fixtures:

- Six client-side route transitions: zero favorite reloads, zero background Server Actions, one Realtime connection/channel before and after, no console errors.
- A simulated incoming reply updated the badge in 30 ms locally after navigation; this is a fixture measurement, not a production latency guarantee.
- Saving still persists. Logout removes the channel; server login re-establishes it without a full browser reload.
- Seven full route loads with existing unread data: no hydration/console errors, Back/Home present, no mobile overflow at 390×844. Preview Back and Home behavior verified.
- Lint, production build, and all 15 existing validation/realtime tests pass. No new dependencies, schema migrations or Next configuration changes.

Real-world speed still depends on Supabase/network response time and photo sizes. No claim of a percentage latency improvement is made. Runtime production preview uses this workspace rather than editing the separate Projects checkout. Unrelated working-tree edits are preserved and excluded from this commit.

## Follow-up: prefetched menu data

### Changes

- Home, Messages and Safety previously used `connection()` ahead of their entire content. That excluded their data from prefetch, even when menu links requested it. They now use a 30-second private cache boundary so Next can prefetch the complete menu destination. Private output stays in the browser's session cache; it is not shared between users in a production server cache.
- Existing Account, Settings, Your listings, Saved and Sell private lifetimes remain 30 seconds. Back/Home and settings links explicitly request full prefetch where needed. Next's existing Link scheduler handles visible links and user intent; no custom prefetch loop or new dependency is introduced.
- Account profile/avatar fields come from one profile query instead of two. Public neighborhood choices start alongside verified Auth, rather than after it. A missing avatar column still falls back for installations awaiting that migration.
- Cookie-bound Supabase clients and verified Auth reads deduplicate only inside one React server render. Separate requests and Server Actions still verify Auth. Conversation rendering can reuse that verification across page, history and safety readers. RLS and participant checks are unchanged.
- Public posting choices (categories, neighborhoods and upload readiness) use a shared cache with a 60-second revalidation interval. Private profiles, saved IDs, messages, reports and listings do not use this shared cache.

### Freshness and invalidation

Existing mutations continue invalidating their relevant paths. Login/logout invalidate the root layout. Chat/inbox Realtime, polling and focus refresh remain enabled; Saved continues reconciling when focus returns. The 30-second lifetime limits reuse of prefetched personal views. Public posting choices may take up to the revalidation window to reflect administrative changes; mutation-time database constraints remain authoritative.

### Practical limits

First visits, expired caches, slow networks and server cold starts can still show loading. Prefetch runs in production (`npm run build` followed by `npm start`), not in `next dev`. No loading/error boundary or authorization check is removed to mask delays. These changes preserve the existing Next configuration and visual design.

### Follow-up validation

Production Playwright checks used an isolated Auth/REST/Realtime fixture with 100 ms added to each backend request. After 1.2–1.5 seconds of prefetch warm-up, the browser was taken offline immediately before each menu click. All destinations rendered their page content from the client prefetch cache:

| Desktop destination | Click to heading |
| --- | ---: |
| Messages | 73 ms |
| Profile settings | 49 ms |
| Your listings | 43 ms |
| Saved items | 61 ms |
| Sell | 48 ms |
| Safety & privacy | 68 ms |
| Help | 50 ms |

Mobile (390×844) prefetch checks passed for Home (99 ms), Saved (58 ms) and Messages (59 ms). Logout invalidated private navigation state and revisiting Account redirected to login. These are local automation measurements with warm caches, not hosted production or cold-load guarantees. Offline console network failures were expected during this deliberate disconnection test.

Lint, production build/TypeScript and all 40 Node tests pass. The additional reader test verifies one profile lookup and a minimal authenticated-user DTO; existing action/access tests still pass. No SQL migration, dependency, configuration or visual change is required.
