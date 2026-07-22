# project

2026-07-22, whole-project migration (legacy new-york style, transformation engine + golden-pair reference), completed

## Changed

- Migrated 28 shadcn wrappers in `src/components/ui/` from Radix to `@base-ui/react`
- Added `@base-ui/react@1.6.0`, removed 21 `@radix-ui/*` packages and `radix-ui`
- Added helpers: `src/lib/resolve-render.ts`, `src/lib/use-controllable-state.ts`, `src/components/ui/slot.tsx`
- Migrated `src/components/shared/mini-calendar.tsx` and `src/components/shared/fields/number-field.tsx`
- Updated consumer `data-[state=...]` selectors in toggle-field, daily-view-sidebar-tabs

## Left alone

- `drawer.tsx` (vaul), `command.tsx` (cmdk), `calendar.tsx` (react-day-picker), `carousel.tsx` (embla), chart (recharts), `sonner.tsx`
- `components.json` style remains `new-york` — future `shadcn add` may fetch Radix variants unless style is changed manually

## Behavior changes

- Accordion `collapsible` on single mode: flagged — verify panels can all close
- Menu items: `closeOnClick={false}` used for `asDialogTrigger` pattern (replaces Radix `onSelect` preventDefault)
- Dialog `onEscapeKeyDown` / `onInteractOutside` on Content: legacy shim only; prefer `onOpenChange` on Dialog root
- Popover `onCloseAutoFocus` / `onOpenAutoFocus`: accepted but no-op
- Toggle uses `aria-pressed` / `data-pressed` instead of `data-state=on`

## Verify by hand

- Admin sidebar collapse/expand (desktop + mobile sheet)
- Checkout: select fields, date pickers, dialogs
- Blog admin: dropdown menus with dialog triggers
- Product page accordion (type=multiple)
- B2B page accordion (collapsible single)

Build: run `pnpm build` after this migration.
