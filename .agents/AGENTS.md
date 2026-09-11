# Project Rules & Guidelines

## Database Commands
- NEVER run `npx prisma db push` or `prisma db push`.
- ALWAYS use `npx prisma migrate dev --name <migration_name>` for database schema changes.

## Build Commands
- Do NOT run production build commands (`npm run build` or `next build`) after code changes unless explicitly requested by the user.
- Use lightweight type checking (`npx tsc --noEmit`) or local dev server testing instead.

