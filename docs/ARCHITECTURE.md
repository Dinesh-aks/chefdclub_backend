# Chefdclub Backend — Architecture

This document describes the architecture and conventions for the Chefdclub backend. It is the reference for how code is organized and how new features should be added once feature work begins.

This backend is a standalone service — a **modular monolith** (not microservices). It is completely separate from the Next.js frontend and communicates with it only via REST APIs over HTTP.

**Migration from Laravel:** feature parity and **existing MySQL data** are required. See [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) before designing schema or running destructive Prisma commands against a legacy database. Each business feature lives in its own module; modules can be extracted into separate services later if the application grows.

```
Next.js Frontend
       ↓
    REST API
       ↓
Node.js + Express
       ↓
     Prisma
       ↓
     MySQL
```

## 1. Backend architecture

**Pattern:** modular monolith + feature-based modules + layered internals.

Within each module, requests flow through a strict, one-directional layering. Each layer only calls the layer directly below it:

```
Route → Controller → Service → Repository → Prisma → MySQL
```

- **Route** — maps an HTTP method + path to a controller function.
- **Controller** — handles the HTTP request/response cycle.
- **Service** — contains business logic, orchestration, and rules.
- **Repository** — the only layer that talks to Prisma / the database (omit when a module has no persistence, e.g. health).

A layer must not skip levels (e.g. a controller must not call Prisma directly, and a route must not contain logic). This keeps each layer independently testable and replaceable.

**Cross-module rules:** one module should not import another module's repository. If module A needs data from module B, call module B's **service** (or introduce shared logic in `src/utils/` only when it is truly generic).

## 2. Folder responsibilities

```
src/
├── modules/          # Feature modules — each owns routes, controller, service, repository, etc.
│   ├── health/       # Example: GET /api/health (no repository)
│   └── …             # reservations, menus, contact, gallery, journal, admin, auth (as built)
├── middleware/       # Cross-cutting Express middleware (error handling, 404s; auth/authz later)
├── config/           # Environment and application configuration (env vars, Prisma client instance)
├── utils/            # Shared, stateless helpers (logger, API response helpers, AppError)
├── types/            # Shared TypeScript types/interfaces (cross-module only)
├── app.ts            # Express app — middleware, mount /api module routes, error handlers
└── server.ts         # Process entrypoint — loads env and starts listening

prisma/
└── schema/           # Multi-file Prisma schema: base.prisma (datasource + generator),
                      # one file per feature (blog, menu, ...), legacy-unused.prisma

prisma7.config.ts     # Prisma 7 config (schema path, migrations path, datasource URL)
```

### Inside a feature module

Create a folder under `src/modules/<feature>/` when that feature is implemented. Typical files (add only what the feature needs):

```
src/modules/reservations/
├── reservation.routes.ts
├── reservation.controller.ts
├── reservation.service.ts
├── reservation.repository.ts
├── reservation.validator.ts
└── reservation.types.ts
```

Register the module's router in `src/modules/index.ts` under its resource path (e.g. `router.use("/reservations", reservationRoutes)`).

Module names should align with API resources and, where practical, with frontend features under `chefdclub_frontend/src/features/` (e.g. `reservations` ↔ `reserve`, `menus`, `contact`).

## 3. Route / Controller / Service / Repository responsibilities

### Routes (`src/modules/<feature>/*.routes.ts`)
- Define HTTP method + path combinations.
- Wire a route to exactly one controller function.
- Contain no business logic and no direct Prisma access.
- All module routers are composed in `src/modules/index.ts` and mounted under the `/api` base path in `src/app.ts`.

### Controllers (`src/modules/<feature>/*.controller.ts`)
- Receive the HTTP request, read `req.params` / `req.query` / `req.body`.
- Delegate request validation to that module's `*.validator.ts` where appropriate.
- Call exactly one service method to perform the actual work.
- Translate the service's result into an HTTP response using the shared response helpers (`src/utils/apiResponse.ts`).
- Never contain business logic, and never call Prisma or a repository directly.
- Do not write repetitive try/catch error-response logic — throw `AppError` (or let errors propagate) and let the centralized error-handling middleware format the response. Async controllers should forward caught errors to `next(err)`.

### Services (`src/modules/<feature>/*.service.ts`)
- Contain business logic: validation rules that depend on business state, coordination across multiple repositories, calculations, etc.
- Are framework-agnostic — they must not import `express` types (`Request`/`Response`) or touch HTTP concerns.
- Call one or more repositories in the **same module** to read/write data (or return data directly when there is no persistence).
- Throw `AppError` for expected/business error conditions (e.g. "not found", "conflict").

### Repositories (`src/modules/<feature>/*.repository.ts`)
- The only layer in a module permitted to import the Prisma client (`src/config/prisma.ts`).
- Expose small, focused functions for a single entity/table (e.g. `findById`, `create`, `updateStatus`).
- Contain no business logic — only data access and query composition.
- Keep Prisma-specific types contained here; services/controllers should not need to import Prisma types directly.

## 4. API conventions

- All routes are namespaced under the base path `/api`.
- Standard REST conventions apply once features are implemented, e.g.:

  ```
  GET    /api/menus
  GET    /api/menus/:id
  POST   /api/reservations
  GET    /api/reservations
  PATCH  /api/reservations/:id
  ```

- Use plural, lowercase, kebab-case-if-multi-word resource names.
- Use HTTP methods semantically: `GET` (read), `POST` (create), `PATCH` (partial update), `PUT` (full replace, if needed), `DELETE` (remove).

Only `GET /api/health` exists today.

## 5. API response format

Every JSON response — success or error — follows one of two shapes, produced via `src/utils/apiResponse.ts` (`sendSuccess` / `sendError`):

**Success**

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

**Error**

```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

Controllers should always use `sendSuccess` / `sendError` rather than calling `res.json()` directly, so the response shape stays consistent across the whole API.

## 6. Error handling

Error handling is centralized in `src/middleware/errorHandler.ts`, registered as the last middleware in `src/app.ts`.

- `src/utils/AppError.ts` defines an `AppError` class (`message`, `statusCode`, optional `errors[]`) for expected/business errors (e.g. validation failures, not-found, conflicts).
- Controllers and services throw `AppError` (or let unexpected errors bubble up) instead of building error responses inline.
- The centralized `errorHandler`:
  - Formats `AppError` instances into the standard error response with the error's own status code.
  - Logs and returns a generic `500 Internal server error` for anything else, so internal error details (stack traces, database errors, etc.) are never leaked to API clients.
- `src/middleware/notFound.ts` handles unmatched routes with a `404` in the same standard error format.
- Appropriate HTTP status codes should always be used (`400` invalid input, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict, `500` unexpected server error, etc.).

## 7. Validation approach

- Request validation lives in each module as `*.validator.ts`, kept separate from controllers.
- A validator is a function (or schema) that checks `req.body` / `req.params` / `req.query` and produces a typed, validated result or throws an `AppError` (typically `400`) with details in `errors[]`.
- No validation library is chosen yet — this will be selected when the first feature requiring input validation is implemented, to avoid adding an unused dependency now.

## 8. Environment variables

- All configuration and secrets are read from environment variables via `src/config/env.ts` — nothing is hardcoded in source.
- `.env` holds real local values and is git-ignored.
- `.env.example` documents every required variable with placeholder values and must be kept up to date whenever a new variable is introduced.
- Current variables:

  | Variable       | Purpose                                  |
  |----------------|--------------------------------------------|
  | `NODE_ENV`      | Runtime environment (`development`, etc.) |
  | `PORT`          | HTTP port the server listens on            |
  | `DATABASE_URL`  | MySQL connection string used by Prisma      |

- Never commit real database credentials, secrets, API keys, or production URLs.

## 9. Prisma conventions

- Prisma **7** targets **MySQL** (`provider = "mysql"` in `prisma/schema/base.prisma`). Connection URL for CLI/migrations lives in `prisma7.config.ts`; runtime uses `DATABASE_URL` in `src/config/prisma.ts` with **`@prisma/adapter-mariadb`** (Prisma’s official MySQL/MariaDB protocol adapter — your server can remain MySQL).
- The Prisma Client is generated to `src/generated/prisma` (git-ignored, excluded from TypeScript/ESLint) and instantiated once as a singleton in `src/config/prisma.ts` with the driver adapter.
- No application models exist yet. Models will be added to `prisma/schema.prisma` when the database schema is designed, followed by `prisma migrate dev` to generate a migration.
- Only repositories import the generated Prisma client — services and controllers work with plain TypeScript types, not Prisma's generated types, wherever practical.

## 10. Database access rules

- All database queries go through a repository function in the relevant module — no `prisma.*` calls in controllers, services, routes, or middleware.
- Repositories return plain data (or throw `AppError` for not-found cases); they do not format HTTP responses.
- Transactions, when needed, are composed inside a repository or service (using Prisma's `$transaction`), never spread across layers.

## 11. Security conventions

Baseline, framework-level security middleware only — no feature-specific security has been implemented yet:

- **`helmet`** — sets sensible security-related HTTP headers.
- **`cors`** — controls cross-origin access from the frontend.
- **`express.json()`** — built-in JSON body parsing (no third-party body-parser needed on Express 5+).
- **Centralized error handling** — prevents leaking internal error details to clients.

Not yet implemented (deliberately out of scope for this task): authentication, authorization, rate limiting, and any user-facing auth APIs. These will be added as a dedicated module (e.g. `src/modules/auth/`) once required.

## 12. Logging conventions

A minimal logging utility lives at `src/utils/logger.ts` (`logger.info` / `logger.warn` / `logger.error`), wrapping `console.*` with a level label and ISO timestamp. No external logging library (e.g. Winston, Pino) is introduced at this stage — this can be revisited if operational needs (log shipping, structured logs, log levels per environment) arise later.

## 13. Adding a new module

When implementing a feature (e.g. reservations, menus, gallery, journal, contact, admin):

1. Add `src/modules/<feature>/` with `*.routes.ts`, `*.controller.ts`, `*.service.ts`, and `*.repository.ts` when persistence is required.
2. Add module-local `*.validator.ts` and `*.types.ts` as needed.
3. Mount the router in `src/modules/index.ts`.
4. Add Prisma model(s) to the feature's file in `prisma/schema/` when the database schema for that feature is designed, then run `prisma migrate dev`.

Deliberately out of scope unless a clear future requirement emerges: microservices, GraphQL, Redis, message queues, WebSockets. This stays a single, modular Express monolith.
