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
