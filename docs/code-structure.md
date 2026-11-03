# Feature boundaries

ZUNO remains one Next.js repository. This refactor standardizes **listings and search**, keeping existing routes, UI, HTTP responses, authentication, RLS checks, upload limits, cache lifetimes and SQL unchanged. Auth, profile, favorites and moderation remain in their established feature folders; their broader reorganization is a later phase. Messages are covered by phase 2 below.

```text
src/
  app/                              # Thin page and HTTP adapters
  features/
    listings/
      components/                   # React UI and view-specific state
      client/prepare-photos.ts      # Browser image preparation (client-only)
      constants.ts                  # Shared choices, labels and limits
      types.ts                      # Public/owner DTOs, inputs and results
      validation.ts                 # Pure input validation
      currency.ts                   # Shared display helpers
      sample-*.ts                   # Demo data only
      server/
        actions.ts                  # Authenticated Next Server Actions
        create-listing.ts           # POST workflow, uploads/publishing/cleanup
        update-photos.ts            # PATCH workflow and photo conflict handling
        read-photo.ts              # Public photo response with RLS
        data.ts                     # Public/detail/saved/profile readers
        owned-data.ts               # Verified owner query and form options
        mapper.ts                   # Database row → safe display DTO
        types.ts                    # Database row shape
        constants.ts                # Server query fields and bucket name
        request-body.ts             # Bounded multipart parsing
        process-photo.ts            # Sharp decoding and normalization
    search/
      client/use-marketplace-feed.ts # URL state, cancellation and UI pagination
      types.ts                      # Shared filter/page DTOs
      validation.ts                 # Pure URL/filter validation
      pagination.ts                 # Pure append/deduplication helper
      server/
        data.ts                     # Public database search
        cursor.ts                   # Node crypto and opaque cursor validation
        page-data.ts                # Server page orchestration
        http.ts                     # Public API response/error policy
```

The dependency flow is UI → Server Action or HTTP route → feature server service → Supabase. Server readers may import shared types/constants/validation. Shared modules must not import browser-only or server-only services. Demo fixture modules no longer define application contracts or formatting helpers.

## Enforced rules

- Server services have `import "server-only"`, so Next rejects accidental client runtime imports. Browser image preparation has `import "client-only"`.
- Client UI in the standardized features cannot import Node, Sharp, server database clients, server services or server-only row types. The explicit `server/actions` entry point is permitted because Next serializes the action reference rather than shipping its implementation.
- Shared contract/validation modules cannot import infrastructure or browser-specific code.
- The standardized page/route adapters cannot instantiate Supabase clients or import Node/Sharp directly.
- Put authorization checks inside every exposed action/handler. Folder placement and type definitions do not replace authentication or database RLS.
- Import client-facing DTOs from `types.ts`; do not use type-only imports from server modules as a shortcut. Avoid mixed client/server barrel exports.

The lint rules are deliberately scoped to phase 1. Auth and Realtime browser clients remain legitimate in their existing features; this phase does not replace them with server-only APIs.

## Verification

ESLint boundary tests prove that action/shared-type imports remain allowed while server services, database clients and Node imports are rejected in the wrong layer. Existing behavioral unit tests use a native-Node loader that resolves TS paths and substitutes only Next's build-time `server-only` sentinel; production imports retain the real marker. No dependency is installed for this test setup.

Behavior checks cover existing listing validation, bounded bodies, image decoding, search/cursor precision and pagination. Build/type checks validate the actual server/client dependency graph. Browser smoke checks use isolated local data; no real user records are modified.

Phase 1 validation: lint, TypeScript/production build and all 32 Node tests pass. Isolated browser checks cover login, owner status/detail/photo editing, publishing and serving an uploaded image, Saved, sending a chat message, server-rendered search, Load more, invalid cursors and Unicode query reloads. The five extracted HTTP/action implementations were also compared with their original bodies. Hosted Supabase policies/provider configuration were not changed or revalidated by these local fixtures. No SQL migration, dependency, Next configuration or intentional visual change is part of this refactor.

## Phase 2 — messages

Messages now follows the same boundaries:

- `types.ts`: message and inbox DTOs.
- `validation.ts`, `inbox-model.ts`, `message-model.ts`, `refresh-queue.ts`: pure validation, filtering, deduplication and queued refresh coordination.
- `client/realtime.ts`: browser-only Supabase subscription lifecycle. Cleanup silences stale channel events.
- `server/actions.ts`, `server/unread-actions.ts`: authenticated message/read actions; database RPCs retain participant, blocking and retry-id guarantees.
- `server/inbox-data.ts`, `server/page-data.ts`: server-only inbox and conversation readers; pages render the resulting data.
- Existing React components remain at the feature root to preserve current component conventions.

Realtime badge reads intentionally use the authenticated browser Supabase client through RLS; routing background refreshes through Server Actions would serialize UI work. Polling, reconnect refresh and event names remain unchanged. Rejected badge RPCs now check the auth generation before changing state, so an old account's rejected request cannot clear the next account's badges. Both the conversation page and history action explicitly check participant IDs in addition to database RLS.

Messages UI and pure modules have lint import boundaries; message pages cannot access Supabase directly. Tests cover overlapping history/send/reconnect batches, trailing refreshes, cleanup, rejected refresh retries, unauthenticated/outsider history access, cursor direction and blocked-send errors. No new migration or dependency is required.

Phase 2 validation: lint, production build (including TypeScript) and all 36 Node tests pass. Existing SQL regression suites were run locally in PGlite, including participant-only chat, retry deduplication, unread cursor privacy/monotonicity and blocking. Isolated browser checks cover login/inbox, mobile message sending, incoming replies, deduplication, fallback delivery while Realtime is disconnected, read-state filtering and desktop reopening. These fixtures do not verify hosted Google OAuth, the hosted publication configuration or actual device networking. The design and polling intervals are unchanged.

## Phase 3 — account, profile and saved items

- `profile/types.ts` defines normalized profile input/result and minimal account DTOs; components no longer import types from action modules.
- `profile/server/data.ts` owns the authenticated reader shared by Account and Settings. The DTO contains only user ID/email, display name, neighborhood choices and avatar path. Existing private cache lifetimes stay on the pages.
- `profile/server/actions.ts` validates profile input, verifies Auth and updates only the current user's editable columns. It returns normalized persisted input, so the form displays the saved trimmed name.
- `profile/server/upload-avatar.ts` preserves the bounded multipart, image decoding, origin/auth checks, owner path, compare-and-swap update and cleanup workflow. The route delegates to it.
- `favorites/server/actions.ts` owns authenticated save/remove operations; `favorites/server/page-data.ts` owns the Saved page reader.
- Favorites' browser RLS reads remain in the provider. Focus/visibility reconciliation refreshes saved IDs, while the Saved page refreshes its server listing snapshot. This includes newly saved items from another tab. Pending mutations block background reconciliation, and auth identity changes isolate pending-request sets so an old account cannot unlock a new request for the same item.

Lint boundaries cover Profile/Saved UI, shared profile contracts and Account/Avatar adapters. Validation includes 39 Node tests, lint, TypeScript/production build, local SQL ownership/privacy suites and isolated browser checks: profile failure/retry and draft preservation, normalized saved name, avatar upload and invalid/origin/unauthenticated/oversized rejection, mobile Account, and two-tab save/remove reconciliation. Hosted OAuth/storage configuration and actual mobile hardware were not tested. No migration, dependency, Next configuration or intentional visual change is included.
