# Chefdclub — Project brief (migration)

This document is the **source of truth for product intent**. Read it before major backend or cross-repo work. Technical conventions live in `ARCHITECTURE.md`.

## What we are building

The client had a production website on **Laravel 5.8** (Bootstrap + jQuery + Vue + Laravel Mix, classic MVC + admin panel). They want a **new UI** and a **new stack**, but **the same features and the same business data** (not a blank restart unless the client explicitly changes that).

| Layer | Stack | Responsibility |
|-------|--------|----------------|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind, shadcn/ui | **Main public website** (new client design) + **admin panel** (modern, professional UI; same capabilities as Laravel admin) |
| **Backend** | Node.js, Express, TypeScript, Prisma, MySQL | **All HTTP APIs** — public (forms, content) and admin (auth, CRUD, lists, status changes, uploads, etc.) |

Laravel is **reference only** (routes, controllers, DB shape, workflows) until cutover. It is **not** the runtime after go-live.

## Repository paths

| Repo | Path |
|------|------|
| Legacy Laravel (reference + data) | `E:\chefdclub\laravel_code` |
| Next.js frontend | `E:\chefdclub\code\chefdclub_frontend` |
| Node API backend | `E:\chefdclub\code\chefdclub_backend` |

## Product requirements (client)

- **UI:** New design for the marketing site; admin must look **modern and professional** (not the old Bootstrap admin).
- **Features:** Parity with what Laravel admin and public site did for Chef'd Club (confirm exact modules with client — reservations, contact, menus/content, blog, gallery, FAQ, settings, reviews, users, etc.).
- **Data:** Preserve / use **existing MySQL data** from the Laravel deployment. Plan **schema alignment** (Prisma models vs legacy tables) and optional ETL or shared DB — do **not** assume an empty database.
- **Not in scope unless requested:** Microservices; keeping Laravel running forever.

## How we deliver

1. **Inventory** Laravel (`routes/web.php`, admin controllers, DB tables) → agreed feature checklist.
2. **Data strategy** — reuse legacy `chefdclub` DB with careful Prisma mapping and migrations, **or** new DB + one-time data migration; avoid Prisma commands that **drop** legacy tables.
3. **Backend** — modular monolith under `src/modules/` (see `ARCHITECTURE.md`): routes → controller → service → repository.
4. **Frontend** — feature folders under `src/features/`; wire `lib/api/` as each API ships.
5. **Vertical slices** — one domain end-to-end (API + DB + public and/or admin UI), not “entire backend first” or “UI-only with mock data forever.”

## Suggested slice order (adjust after inventory)

1. Admin auth + admin shell (Next `app/admin`)
2. Reservations (public submit + admin list/status — Laravel admin already has this)
3. Contact / inquiries
4. Content: menus, FAQ, CMS blocks, gallery, blog — as confirmed with client

## Related docs

- Backend structure and layers: `ARCHITECTURE.md`
- Laravel route/table inventory: `LARAVEL_INVENTORY.md`
- Frontend structure and design system: `../../chefdclub_frontend/docs/ARCHITECTURE.md`
