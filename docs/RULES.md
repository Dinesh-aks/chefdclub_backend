# Project rules

Working rules for this repo. Layering and conventions live in [`ARCHITECTURE.md`](./ARCHITECTURE.md); product intent lives in [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md).

## Return only the data that is needed

- Never return more data than the client screen needs.
- **List endpoints** (`GET /api/admin/<feature>`) select only the fields the admin table shows. Use Prisma `select` in the repository. Leave heavy fields (HTML bodies, descriptions, messages) for the by-id endpoint. Give list rows their own type, e.g. `FaqListItem`, `BlogPostListItem`, `ContactMessageListItem`.
- **By-id endpoints** (`GET /api/admin/<feature>/:id`) return the full record. The frontend edit and detail pages use these, so every admin feature should have one.
- Search may still match on fields the list does not return (it filters in `where`, not in `select`).
- Filtering, search, sort and pagination are done in the database, never by loading everything and filtering in memory. Admin list filters (e.g. `category`, `status`) are optional query params validated in the module's `*.validator.ts`; `all` or an empty value means no filter.
- When a screen needs only some fields of a record, support a `?fields=` whitelist rather than always sending everything (see `GET /api/admin/pages/:slug`).

## Public vs admin responses

- Public endpoints may expose fields the website needs (e.g. SEO fields); admin endpoints expose what the admin form needs. Do not reuse one shape for both if they differ — add a separate admin view/mapper in the controller.
- All admin routes sit behind `requireAdminAuth`.

## Layering

- Keep `Route → Controller → Service → Repository`. Only repositories talk to Prisma. See `ARCHITECTURE.md`.

## Database safety

- Never delete anything from the database: no `DELETE`/`DROP`/`TRUNCATE`, no removing a column or table, no migration that drops or wipes data, and no `prisma db push --accept-data-loss`. The database is the legacy Laravel one and holds real data.
- When a field is no longer asked for in the admin form or API, remove it from the code only and leave the column alone.
- A legacy column that is `NOT NULL` stays as it is. Write a default or generated value instead, e.g. `""` for a missing description or image, or a slug generated from the name (see `menu-category.validator.ts`).
- Do not change the Prisma schema or models unless that is the task. Read-only queries are fine.
