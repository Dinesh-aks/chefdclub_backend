# Prisma migrations and legacy database

The production Laravel app uses the MySQL database configured in `DATABASE_URL` (typically `chefdclub`).

- **Do not** apply migrations that create parallel tables (`contact_messages`, `reservations`) or run `prisma migrate reset` on this database.
- New Node features should **map Prisma models** to existing Laravel tables (`@@map`) until a deliberate cutover/migration is planned.
- When adding models, prefer `npx prisma db pull` against a backup or dev copy, then trim and rename fields in `schema.prisma`.
