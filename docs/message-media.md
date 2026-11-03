# Messages: photos, files and conversation design

## Deployment

Apply `supabase/migrations/202611030012_message_attachments.sql` once, after migrations 001–011, using the project's Supabase SQL Editor (or your existing migration workflow). Then deploy this branch. The migration creates the private `zuno-message-files` bucket, attachment metadata table, participant RLS policies and authenticated atomic-send RPC. No service-role key or new environment variable is needed. Do not make the bucket public.

The hosted migration has **not** been applied from this workspace. Until it is applied, existing text chats remain usable, attachment buttons are disabled, and the UI says photo/file sharing is being prepared. SQL tests in `supabase/tests/message-attachments.sql` are for a disposable database, not production.

## User behavior

Only Messages changes visually. Desktop has a searchable conversation rail and selected chat pane; mobile opens a full-screen conversation. The header links to the participant's public profile and shows their avatar, neighborhood and the original listing preview. Incoming bubbles show the author's avatar; missing/broken avatars fall back to an initial. Existing unread badges remain red. Report/block tools remain available under Conversation options.

The composer supports text, photos and documents, Enter to send, Shift+Enter for a newline and composition-safe input. Users can choose/remove attachments before sending. A message may contain up to four attachments. Original still JPG/PNG/WebP photos may be up to 10 MB; browser preparation reduces them before upload. Documents may be PDF, TXT, CSV, ZIP, DOCX or XLSX. The prepared aggregate upload limit is 3 MiB, keeping the bounded multipart request below typical hosting limits. File cards show the name, type, actual size and a download action. Photos open through an authenticated image endpoint.

Sent indicators mean the server accepted the message; they do not claim the other person read it. Sender read receipts are outside this change. Existing private read cursors/unread counters continue working.

## Data and access

`message_attachments` references the existing message. Sending a group creates one parent message, so unread counts and cursor ordering remain consistent. The RPC locks the conversation before allocating the message ID, verifies the participant and block state, checks uploaded object metadata/path, then atomically inserts the message and attachment rows. The `(conversation_id,sender_id,client_id)` key makes retries idempotent.

Uploads use the user's verified session and Storage API, never a service-role client. Photos are decoded and reencoded to WebP, stripping metadata. Documents have a restricted extension/MIME list, signature checks for PDF/ZIP containers and UTF-8 validation for text. Document download responses force attachment disposition; all media responses use `private, no-store`, `nosniff` and a restrictive CSP. These checks do not constitute antivirus scanning.

Recipients can access only files linked to conversations they participate in. Uploaders may access their own staged objects for cleanup; other participants cannot access those until the message is committed. Attached objects cannot be deleted through the uploader's cleanup policy. Cleanup checks which uploads became attached before removing unused files after confirmed success or a definitive database rejection. It skips cleanup entirely on an ambiguous RPC/network response: the transaction may still be in flight even if a metadata query looks empty. Private unconfirmed uploads can remain for later administrative cleanup rather than risking deletion of a delivered file.

The public profile/listing readers and all non-Messages styles remain unchanged. New styles live in `src/app/messages/messages.css`; the shared global stylesheet is excluded from this change. No dependency or Next configuration change is needed.

## Validation

- Lint, TypeScript/production build and 44 Node tests pass. New tests cover selection/type/size bounds, image decoding, document signatures, authenticated media routes, blocked sends, safe cleanup and retry after a lost commit response without duplicate upload.
- All existing SQL regression suites plus migration 012 pass locally in PGlite. Media cases include sender/recipient access, stranger/anonymous denial, forged paths/MIME/size, staged cleanup, attached-file deletion denial, atomic/idempotent sends, unread counts and bilateral blocking.
- Isolated production Playwright checks: text and multi-photo sends, PDF upload/download with original filename, selected-file removal/menu Escape, failure with draft/file retention and retry, incoming Realtime message, missing migration text fallback, blocked composer/history, anonymous download denial, origin rejection, malformed PDF/oversized body rejection, and returning to Home/Account.
- Native viewports checked: desktop 1440×1000, mobile 390×844, and intermediate 768 px. No horizontal overflow. Actual mobile hardware and hosted Storage configuration remain unverified.

## Accepted design comparison

Accepted concept: `exec-d58e3107-4d78-4c36-a8fe-8da4b89cf5a7.png` from the approved Messages design in this conversation. The concept and final Playwright PNGs were inspected with `view_image`. Browser/IAB control was unavailable, so Playwright Chromium provided browser verification.

Inspected comparison points: white/teal/mint palette; split desktop rail/pane and mobile single pane; circular avatars left and item thumbnails right; selected-row treatment and red unread counters; participant/listing headers; incoming/outgoing bubble alignment; photo groups and downloadable file cards; attachment popup and bottom composer. Sidebar proportions and attachment width were adjusted after comparison, and the mobile frame was isolated from the site's bottom-nav padding. No fixable layout mismatch remains in those verified surfaces.

UI copy retained from the concept includes Messages, Search conversations, All, Unread, View item, Photo, File and Write a message. Intentional differences: existing ZUNO Brand is preserved; actual account/listing/media data replaces example content; missing avatars use initials; sent-only status replaces unimplemented read receipts; safe upload limits and useful errors are visible. QA avatars/media are disposable fixtures and are never shipped as fake user data.

Storage policy/API behavior was checked against [Supabase access control](https://supabase.com/docs/guides/storage/security/access-control) and [Storage schema](https://supabase.com/docs/guides/storage/schema/design). File mutations go through the Storage API; direct storage-row inserts in SQL are limited to disposable test fixtures.
