# Messages — selected Soft Cards

Reference: `/Users/tojiboevolimjon/.codex/generated_images/01a19b1b-a4ae-7ea2-8aa4-f1f3204bd684/exec-19d09f03-d0ba-4c95-8d29-be23f9959aa7.png`, middle option 02. User override: unread count badges are red, not teal.

Design tokens before implementation: white page, charcoal #1F2328 text, teal #0F766E controls, pale mint #F0FDFA unread cards, thin #D9EAE7 borders, soft shadows, 18px card radii. Left circular avatar 48–56px; seller/counterpart name and snippet in the flexible middle; real listing thumbnail 52–56px at the right. Red #DC2626 badge with white digits. Geist typography, 30px mobile heading, 16px bold seller name, 14px snippet, 12px location/time. Centered header logo with shared Back/Home, native search input, All/Unread filter pills. Desktop uses the same centered list, not stretched mobile rows.

Only real conversation/profile/listing data will be displayed. Empty/missing images use initial-letter/avatar and neutral product placeholders. For a seller, the row identifies the buyer counterpart. The concept's portraits, names and sample messages are illustrative and are not seeded into production.

## Data and rollout

Apply `supabase/migrations/202611030008_inbox_previews.sql` after migrations 001–007. It creates a participant-only inbox projection returning the opposite participant's current public name/avatar, latest message snippet (bounded to 180 characters), public listing neighborhood and first visible listing photo. Deleted/removed items retain the conversation and title snapshot, but do not expose unavailable photos. Existing profile/photo permissions stay unchanged. The seller sees the buyer counterpart, never themselves.

Until 008 is applied, the page retains an RLS-protected compatibility path with real conversation names and public listing thumbnails; avatars/snippets remain initials and Open the conversation. Other RPC/network/authorization errors are not treated as missing migrations. No admin/service-role key is used. The page stays uncached for fresh private messages. Realtime refresh is retained with visible-tab polling fallback. No fake names, generated portraits or demo conversations ship in the app.

## Fidelity and browser verification

Browser/IAB automation was unavailable; used Playwright Chromium with an isolated Auth/REST/Storage/Realtime fixture. Reference is a native 1536×1024 three-option board, so it has no single-screen native viewport; checked the selected composition at 390×844 mobile and 1440×1000 desktop, plus overflow at 320/680/1024. The source concept and final mobile screenshot were both inspected with view_image in the same QA pass.

| Comparison | Evidence / result |
|---|---|
| Structure | White page, centered logo, Back left/Home right, heading, search and All/Unread pills match option 02. |
| Cards | Separate rounded cards, subtle border/shadow and mint unread tint; circular left avatar and small right product photo retained. |
| Typography | Existing Geist retained; bold counterpart name, one-line message and muted location/time preserve hierarchy. |
| Palette | Teal/mint/white preserved. Unread badges deliberately changed to #DC2626 with white digits, including shared navigation counters, per user request. |
| Assets/data | Actual user avatars and listing photos; initial-letter and image placeholders for missing/broken media. Fixture initials and existing sample product photos differ intentionally from the illustrative portraits/products. |
| Copy | Messages, Search conversations, All and Unread match; real names/snippets/timestamps replace illustrative copy. Empty, no-match and unavailable-unread states have actionable labels. |
| Responsive | Single centered desktop list and full-width mobile cards; no horizontal overflow. Existing accessible floating mobile dock is retained rather than copying a decorative mock navigation. |

Verified: four rows/images, red computed badge RGB(220,38,38), two unread conversations, search by product, no-match/reset, opening chat and read-count update, existing avatar loading, broken-avatar/thumbnail fallbacks, missing-RPC compatibility and mobile overflow. Fixture photo/avatar writes touched no real user data. SQL tests cover correct buyer/seller counterpart, latest preview, photo sort order, absent actor/anonymous/stranger denial, removed/deleted item privacy and bounded snippets. Lint, production build and all 22 Node tests pass. Real Supabase previews require applying 008 and a post-migration smoke test.
