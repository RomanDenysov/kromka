# AGENTS.md

Guidelines for AI agents working on the Kromka codebase.

## Project

Next.js 16 bakery e-commerce with React 19, TypeScript, PostgreSQL (Drizzle), Tailwind, shadcn/ui.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm typecheck        # TypeScript check
pnpm lint             # Check with Ultracite (Biome)
pnpm lint:fix         # Auto-fix lint issues
pnpm format:fix       # Format code

# Database
pnpm db:push          # Push schema changes
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

**No test framework is currently configured.**

## Code Style (Ultracite/Biome)

**Imports & Exports:**

- NO barrel files (`index.ts` re-exports) - import directly from specific files
- Use `for...of` over `.forEach()`
- Prefer arrow functions for callbacks

**Types:**

- Use `const` by default, `let` only when needed
- Prefer `unknown` over `any`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Explicit return types on exported functions when helpful

**Naming:**

- Components: PascalCase (e.g., `ProductCard.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE or camelCase
- File names: kebab-case for utilities, PascalCase for components

**Error Handling:**

- Use `try-catch` meaningfully; prefer early returns
- Throw `Error` objects with descriptive messages

**Logging:**

- Use logger from `@/lib/logger.ts` instead of `console.log`
- Use `log.{module}` for module logs (e.g., `log.orders`, `log.auth`)
- Use `createRequestLogger(module, context)` for request-scoped logging

**React/Next.js:**

- Server Components by default
- Add `"use client"` only for event handlers, browser APIs, client state
- Add `"use server"` for server actions
- Add `"use cache"` for cached queries (use with `cacheLife()` and `cacheTag()`)
- Use Next.js `<Image>` and `<Link>` components
- React 19: use `ref` as prop (no `forwardRef`)

## Architecture

**Feature Modules** (`src/features/{name}/`):

```
api/
  queries.ts      # "use cache" for public, no cache for admin
  actions.ts      # "use server" with auth guards
schema.ts         # Zod validation
components/       # Feature-specific components
hooks/            # Custom React hooks
```

**Route Groups:**

- `src/app/(public)/` - Customer-facing pages
- `src/app/(admin)/admin/` - Admin dashboard
- `src/app/api/` - API routes

**Auth:**

- Wrap admin actions with `await requireAdmin()` from `@/lib/auth/guards`

**Caching (Next.js 16):**

- Use `updateTag("tag-name")` from `next/cache` to invalidate cached queries after mutations
- Example: `updateTag("products")` after updating a product

## Conventions

- **Imports:** Use `@/` path alias (e.g., `@/features/products/api/queries`)
- **Language:** Slovak for user-facing content, English for code
- **Prices:** Store as cents (integers)
- **Dates:** Pickup dates as `YYYY-MM-DD` strings
- **IDs:** Prefixed CUIDs (`prod_`, `ord_`, `cat_`, `sto_`)
- **Commits:** Conventional format: `type(scope): subject`

## Styling

- Tailwind CSS with mobile-first approach
- Use `cn()` utility for conditional classes
- shadcn/ui components in `src/components/ui/`
- Dark mode ready

## Forms

- React Hook Form + Zod validation
- Validation schemas in feature `schema.ts` files

## Documentation

Reference docs in `docs/` directory:

- `docs/database-schema.md` - Database tables, relationships, patterns
- `docs/features/` - Feature-specific documentation (checkout, b2b)
- `docs/specs/costing-architecture.md` - Pricing model + cross-cutting decisions (cited from code)

## Pre-commit Checklist

- [ ] Run `pnpm lint:fix`
- [ ] Run `pnpm typecheck`
- [ ] Remove debug statements


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
