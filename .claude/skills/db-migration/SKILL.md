---
name: db-migration
description: Generate and validate Drizzle ORM migrations with Neon HTTP safety checks
disable-model-invocation: true
---

# Database Migration Skill

Guide the user through safe Drizzle ORM schema changes for a Neon HTTP (serverless) PostgreSQL database.

## Constraints

- **Neon HTTP driver**: `db.transaction()` and `db.batch()` are NOT supported. Never generate migrations that rely on transactions.
- **Schema file**: `src/db/schema.ts` (1200+ lines). Changes affect production data and are hard to reverse.
- **IDs**: Use prefixed CUIDs (`prod_`, `ord_`, `cat_`, `sto_`, etc.) via `createId()` from `@/lib/ids`.

## Workflow

### Step 1: Propose the change

Before editing `src/db/schema.ts`, describe:
1. What columns/tables/constraints will be added, removed, or modified
2. Whether this is additive (safe) or destructive (data loss risk)
3. Impact on existing queries in `src/features/*/api/queries.ts` and `src/features/*/api/actions.ts`
4. Whether Zod schemas in `src/features/*/schema.ts` need updating

**Wait for explicit user approval before proceeding.**

### Step 2: Edit the schema

- Edit `src/db/schema.ts` with the approved changes
- Follow existing patterns: use `text()` for string fields, `integer()` for prices (cents), `timestamp()` with `defaultNow()` for dates
- Add appropriate indexes and relations

### Step 3: Generate the migration

```bash
pnpm db:generate
```

### Step 4: Validate the generated SQL

Read the generated migration file in `src/db/migrations/` and verify:
- [ ] No `BEGIN`/`COMMIT`/`SAVEPOINT` statements (incompatible with Neon HTTP)
- [ ] No `DROP COLUMN` or `DROP TABLE` without user's explicit approval
- [ ] `NOT NULL` columns have a `DEFAULT` or a backfill strategy
- [ ] New indexes won't lock large tables (prefer `CREATE INDEX CONCURRENTLY` for production)

### Step 5: Update dependent code

- Update Zod schemas if field shapes changed
- Update queries/actions that reference modified columns
- Update `docs/features-catalog.json` if DB tables changed
- Run `pnpm typecheck` to verify no type errors

### Step 6: Test locally

```bash
pnpm db:push  # Push to dev database
pnpm dev      # Verify the app works
```

## Red flags to warn about

- Removing or renaming columns that existing queries depend on
- Changing column types (e.g., `text` to `integer`) without a data migration plan
- Adding `NOT NULL` constraints to existing columns without defaults
- Dropping indexes that queries rely on for performance
