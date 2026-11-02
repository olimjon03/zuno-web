# Existing menu hardening

## Changes

- Saved read failures no longer masquerade as an empty list. A retry action rechecks the session and retries loading, while retaining the last known IDs for the same account. Favorites cannot be toggled against unknown state after a failed read. Account changes still clear prior identity state.
- Listing management explicitly dispatches submitted FormData and the chosen intent. Failed actions preserve title, price, description, category and neighborhood; Enter defaults to editing, not a destructive action. Removal still requires confirmation and server-side ownership.
- Chat background read failures are distinct from sending failures. A successful refresh clears only the refresh warning; failed-send drafts remain until retry. Existing client IDs deduplicate retried sends.
- Desktop account and mobile menus share typed destination definitions and segment-aware active matching. Saved never also activates My ZUNO. Navigation labels, focus handling and prefetch behavior are retained. Saved hearts use the selected teal palette.
- Each planned feature button announces Coming soon, the search result count is announced, and an empty feature search has a clear/reset button. No placeholder was promoted into a fake working service.

## Current status

| Section | Status | Exercised behavior |
|---|---|---|
| Marketplace | Working | Listing links, saved action, navigation |
| My ZUNO | Working | Desktop/mobile destinations, selected states, feature search |
| Saved items | Working | Read failure vs empty state, retry recovery, removed-item hiding |
| Your listings | Working | Failed edit retention, retry, sold/available, confirmed removal |
| Sell | Working | Photo upload, publication, listing detail and own-listings visibility |
| Messages | Working | Failed send retention, single delivery on retry, read failure and recovery |
| Profile settings / public profile | Working | Failed save retention, retry, avatar upload/display, public email exclusion |
| Help / About | Working | Real destination and existing FAQ |
| 18 Explore feature menus | Planned | Coming-soon dialogs, Escape, restored focus, search/reset |

## Validation

Playwright Chromium fallback was used because Browser/IAB automation was unavailable. All mutations used an isolated Auth/REST/Storage/Realtime fixture, not real user records. Verified the flows above; all 18 distinct planned menu dialogs restored trigger focus on Escape; six protected sections redirected an unauthenticated context to login; mobile Saved had a single active item and no 390px overflow. An injected Saved read failure showed Retry rather than a false empty state; retry restored a previously saved item. Confirmed failed edits retained category=1/neighborhood=2 and text, and a failed chat send preserved its draft and produced one delivery on retry. The recovered mobile view was inspected with view_image.

Lint, production build, 16 Node tests including route-boundary regression checks, and all seven disposable SQL/RLS suites pass. SQL checks include ownership, private chat, favorites, photo rules, unread cursors and public-profile projection. Existing Node module-type warnings are harmless and unchanged. No new dependency, configuration or migration is introduced.

Production auth-provider sign-in is not automated here; prior Supabase setup remains required. Planned services are still unavailable. Unrelated README/deployment/package edits were left outside this commit.
