# Production schema comparison — 2026-11-06

Compared production catalogs through read-only SQL with a clean PGlite replay
of GitHub main cb2641270c2a482778870770d9f9be8fa7ec03b2 (migrations 001–027).
No production changes were made.

| Area | Clean replay | Production | Result |
| --- | --- | --- | --- |
| Public columns | 152 | 152 | Keys, SQL data types, nullable and identity flags match |
| Public functions | 46 | 46 | Identity arguments, body MD5, SECURITY DEFINER flag and function config match |
| Shared public policies | 45 | 45 | Commands, roles, USING and WITH CHECK match |
| Extra public policies | 0 | 3 | Production-only reader policies below |
| FK/PK/unique/check constraints | 133 | 133 | Names and normalized definitions match |

The local engine additionally exposes 138 NOT NULL constraints as pg_constraint
entries. Production represents these differently. information_schema nullable
flags match on all 152 columns, so these catalog-only entries are excluded from
the constraint comparison.

## Production-only permissions

The following SELECT policies use USING(true) and target only zuno_admin_reader:

- profiles.zuno_admin_reader_profiles
- listings.zuno_admin_reader_listings
- listing_reports.zuno_admin_reader_reports

The role has LOGIN and does not have BYPASSRLS. These policies grant broad read
visibility within the three tables to that role when table privileges allow it.
Their intended owner, application use and role membership still need verification.
Do not remove them without checking the consumer. Role creation/grants and these
policies should be recorded in a reviewed migration or an explicit external-role
provisioning procedure after that verification. No role credentials were read.

## Limits and next work

This is a structural subset comparison, not a complete schema equivalence proof.
Column defaults, numeric/string modifiers, generated expressions, function return
types/owners/EXECUTE grants, indexes, triggers, table ACLs, role memberships,
Storage policies and Auth schemas still need comparison.

The earlier production migration history inspection showed only one history
entry. Matching current definitions does not reconstruct deployment history.
Do not mark historical migrations applied until the remaining catalog review
and operational provenance checks are complete.

The index migration in PR70 is outside this main baseline. Apply/review it
separately and rerun the index check after deployment.

Validation: complete isolated migration replay and existing SQL regression suite
passed while collecting this inventory. No production user records were read.

## Reader role follow-up

Read-only catalog inspection found these explicit column-level SELECT grants:

- profiles: id, display_name, created_at
- listings: id, title, status
- listing_reports: id, listing_id, status

No explicit table-level grants were returned. Only postgres was listed as a
member of the reader role. The role is neither superuser nor CREATEROLE/CREATEDB,
and does not bypass RLS. There were zero active connections at inspection time;
this does not establish that the role is unused.

Repository search found no consumer of this role outside this audit document.
The actual service/credential owner cannot be inferred from catalog privileges.
Confirm that owner before documenting provisioning or revoking access.
