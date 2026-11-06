# Deleted-account chat retention

## Rollout

1. Review/apply `supabase/migrations/20261106170442_preserve_deleted_account_chats.sql` on ZUNO Web's existing Supabase project, after migrations 025/027. The migration assumes the existing messages/inbox/media schema. No real account should be deleted as a test in production.
2. Deploy the merged Web PR. This action fails closed if the new preparation RPC is absent, before Storage cleanup. The Storage manifest RPC also rejects legacy cleanup before archival/admin preflight, protecting the migration/code rollout gap. A server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) is still required; never expose it through NEXT_PUBLIC variables. Existing production settings were not inspected/changed by this PR.
3. Use two disposable staging accounts plus an unrelated third account. Exchange text, photos and files; delete one via the UI and verify the survivor can read/download its history, sees Deleted account with no profile link/avatar/address and cannot send or use trade/block actions. The unrelated account must not read either history or retained files. Then delete the survivor and confirm remaining conversation/files are cleaned. Test missing Storage copy permissions, retries and concurrent attempts before production acceptance.

## Behavior and recovery

Auth users/profiles/listings and private account data are hard deleted as before. Conversation participants and message sender FKs use SET NULL rather than cascading away the survivor's history. A BEFORE DELETE Auth trigger scrubs participant name snapshots and removes the conversation only after both participants are gone. Existing RLS still checks the remaining participant. Unread counts include anonymized senders. Conversation UPDATE Realtime notifications refresh names/read-only state; focus/poll fallback remains.

Committed outgoing shared files are copied with the Storage API into a reserved `recipient/conversation/retained/attachment` path as the service role (ownerless per Storage behavior), with custom metadata copying disabled. A narrow service-only RPC validates destination/size/mime/ownership and atomically switches the attachment reference before ordinary ownership/prefix cleanup removes originals. Normal clients cannot upload/delete reserved archive paths. No direct Storage object-row deletion or ownership rewrites are performed by the migration. The files remain private under conversation participant policies. A surviving user's later deletion cleans these files through its normal prefix manifest.

Copies use deterministic, service-reserved paths; a retry reuses an existing valid copy and validates it before committing. If a copy/commit fails, Auth deletion and destructive cleanup do not run. There are at most 10 archival copies and five cleanup batches per action; larger accounts return a progress/retry message. This is resumable request-driven cleanup, not a background job. Auth tokens for a deleted user cannot regain conversation access because its participant IDs are nulled; remaining access-token/session limitations of Supabase still apply elsewhere.

Admin membership (including revoked membership rows) in the optional `zuno_admin.staff_memberships` schema has an existing RESTRICT FK. A preparation check now explains this **before** marking a new deletion or deleting files. It does not remove admin roles, bypass the admin FK restriction or erase audits. Transfer admin access and arrange trusted membership-row removal first if deletion is intended; revoking a role alone leaves its RESTRICT reference. A deleting_at flag already set by a previous failed admin deletion requires operator review before canceling/resetting that state; prior removed files cannot be recreated by this change.

Deletion errors log only `[zuno-account-deletion]`, stage, sanitized error code and status. Use these to distinguish missing migration (`prepare/PGRST202`), Storage archive/remove failures and final Auth FK/config failures. No keys, object paths, email, message text or raw upstream errors are logged. Do not promise that a generic production failure is fixed before that stage is verified. Previously cascade-deleted chat history is not recovered without backups. Attachments whose Storage object was already removed by an earlier failed cleanup are not re-copied and do not block account deletion; their existing unavailable-file behavior remains, since missing bytes cannot be recovered here.

## Verification performed

Isolated PGlite tests model Storage rows (not actual blobs) and verify hard deletion, anonymization, survivor-only message/file reads, rejected sends/uploads, unread counts, both-party cleanup, fail-closed unarchived files and admin preflight. Node tests exercise privileged-action identity validation, safe diagnostic logging, archive copy/commit/delete order, retry, partial failure and pending batches. Real local Supabase Auth/Storage integration also passed using Docker PostgreSQL 17 and Storage API v1.88.0: WebP/PDF bytes were hash-verified after archival; original files/avatar, Auth user, profile and listings were removed; the survivor retained anonymized, read-only history; a stranger was denied access; deleting the survivor removed the conversation and archives. A 12-file case verified bounded pending cleanup, existing-copy reuse and invalid-commit rejection. A disposable local admin membership blocked deletion before avatar/account cleanup. No real production account deletion was performed. Hosted production versions/configuration may differ, so production rollout still requires migration review and normal smoke checks.

Read-only production diagnosis confirmed CASCADE chat/sender FKs and the admin membership RESTRICT FK. Recent Auth/Postgres logs also contained admin-membership-related errors. No production schema or role memberships were modified; real Storage tests subsequently ran in an isolated local Docker stack without creating a paid hosted project.

After the owner explicitly asked to keep the admin account, its stale deleting_at flag from the failed attempt was cleared in production, scoped to the provided owner email plus an existing admin membership. A read-only verification confirmed the account remained present, deleting_at was null, and active admin membership remained. This cancellation does not recreate files the earlier failed cleanup may already have removed.

## Repeat the real local test

Use an isolated Supabase CLI work directory with project ID `zuno-retention-local`, default API port 54321 and local Docker database container `supabase_db_zuno-retention-local`. Apply this repository’s SQL migrations in filename order to that local database only. Do not link this test stack to a hosted project.

Save `supabase status --workdir <local-workdir> -o json` to a private file outside the repository (permissions 600), then run:

```sh
node scripts/test-account-deletion-local.mjs /absolute/path/to/private-local-status.json
```

The runner accepts only HTTP loopback URLs on port 54321, creates disposable `.invalid` Auth accounts and real Storage uploads, and cleans its own fixtures. It does not read production environment variables. Its admin-safety fixture uses only the fixed local Docker container. Never commit the status file or its service key.

The real test exposed a Storage HEAD/exists error for missing objects. Cleanup now uses object info and recognizes structured `NoSuchKey`/404 responses; unrelated lookup errors still stop deletion safely.
