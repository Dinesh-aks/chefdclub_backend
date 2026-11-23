# Chefdclub Backend

Backend API for Chefdclub — a standalone service, separate from the Next.js frontend.

**Product context (Laravel migration, data, scope):** see [`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md).

## Tech stack

- Node.js
- Express.js
- TypeScript (strict mode)
- Prisma ORM 7
- MySQL

## Architecture

```
Node.js
  ↓
Express.js
  ↓
Prisma
  ↓
MySQL
```

## Folder structure

```
src/
├── modules/          # feature modules (routes → controller → service → repository)
├── middleware/       # Express middleware (error handling, etc.)
├── config/           # env config, Prisma client
├── utils/            # shared helpers
├── types/            # shared TypeScript types (cross-module)
├── app.ts            # Express app wiring
└── server.ts         # server entrypoint

prisma/
└── schema/            # Multi-file schema: base.prisma + one file per feature

prisma7.config.ts        # Prisma 7 CLI config (migrations, `DATABASE_URL`)
```

See `docs/ARCHITECTURE.md` for module layout and conventions. Laravel parity checklist: `docs/LARAVEL_INVENTORY.md`.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and update the values (`DATABASE_URL`, and Turnstile secret keys for contact/reservation forms when captcha is enabled):

```bash
cp .env.example .env
```

### 3. Generate the Prisma client

```bash
npm run prisma:generate
```

### 4. Run the dev server

```bash
npm run dev
```

The server starts on `http://localhost:5000` (or the `PORT` set in `.env`).

Health check: `GET /api/health`

## Scripts

| Command                  | Description                              |
|---------------------------|-------------------------------------------|
| `npm run dev`              | Start the dev server with hot reload      |
| `npm run build`            | Compile TypeScript to `dist/`             |
| `npm start`                | Run the compiled server from `dist/`      |
| `npm run lint`              | Run ESLint on the `src/` folder           |
| `npm run prisma:generate`   | Generate the Prisma client                |
| `npm run prisma:migrate`    | Run Prisma migrations (dev)                |

## Notes

- No database models, authentication, or business-logic APIs exist yet — this is the foundational scaffold only.
- Prisma is initialized with the MySQL provider but has no models defined.
