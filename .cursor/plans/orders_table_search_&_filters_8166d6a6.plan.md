---
name: Orders table search & filters
overview: Add simple client-side search + two multi-select filters (order status, payment status) to your existing TanStack-based Orders table, using minimal new UI and small column filter glue.
todos:
  - id: dt-search
    content: Make DataTableSearch a proper controlled component (value/onSearch/placeholder).
    status: pending
  - id: dt-multifilter
    content: Add a minimal multi-select dropdown filter component that writes to a column’s filter value (string[]).
    status: pending
  - id: orders-filterfn
    content: Add filterFn for multi-select columns (status/paymentStatus[/paymentMethod]) in orders columns.
    status: pending
  - id: orders-toolbar
    content: Wire global search + two multi-select filters into OrdersTable toolbar and add globalFilter state to table.
    status: pending
  - id: cleanup-pagination
    content: Remove debug console.log from DataTablePagination.
    status: pending
  - id: verify
    content: Verify search/filter + export behavior and no regressions.
    status: pending
---

## What you have today (quick analysis)

- `OrdersTable` already manages **sorting, pagination, rowSelection, columnFilters** and enables `getFilteredRowModel()` so **column filtering works** if something sets `columnFilters`.
- See `OrdersTable` state wiring in [`src/components/tables/orders/table.tsx`](src/components/tables/orders/table.tsx).
- Your `orders` columns already include rich filter metadata for status/payment (`meta.variant: "multiSelect"`, `meta.options: [...]`).
- See `status` / `paymentStatus` in [`src/components/tables/orders/columns.tsx`](src/components/tables/orders/columns.tsx).
- The missing part is mostly **UI**:
- `DataTableSearch` is currently a stub and doesn’t call `onSearch` / accept props properly: [`src/components/data-table/data-table-search.tsx`](src/components/data-table/data-table-search.tsx).
- There are no `DataTableFilterMenu/List/Toolbar` components in your repo yet (only 7 data-table components exist).

## Chosen approach (simple, no over-engineering)

- Keep everything **client-side** (your page loads all orders via `getAllOrders()`), so filtering/search just updates table state.
- Add:
- **Global search** (single input) that filters orders by a few important fields.
- **Two multi-select dropdown filters** that write to `columnFilters` for `status` and `paymentStatus`.
- Optional **Reset** action.

## Implementation steps

1. **Make `DataTableSearch` a reusable controlled input**

- Update [`src/components/data-table/data-table-search.tsx`](src/components/data-table/data-table-search.tsx) to:
- accept `value`, `onSearch`, optional `placeholder`, optional `className`.
- call `onSearch(e.target.value)` on change.
- (Optional) add small debounce using your `useDebouncedCallback`.

2. **Add a tiny reusable multi-select filter dropdown component**

- Create a small component (minimal props) in `src/components/data-table/` (e.g. `data-table-multi-select-filter.tsx`) that:
- takes `table`, `columnId`, `title`, `options`.
- reads `const column = table.getColumn(columnId)`.
- stores selected values in `column.getFilterValue()` as `string[]`.
- toggles values via `column.setFilterValue(nextArrayOrUndefined)`.

3. **Teach the relevant orders columns how to filter with multi-select values**

- Update [`src/components/tables/orders/columns.tsx`](src/components/tables/orders/columns.tsx) for `status`, `paymentStatus` (and optionally `paymentMethod`) to add a `filterFn` that supports `string[]` filter values:
- `return filterValues.includes(row.getValue(columnId))` when `filterValues` is an array.
- This keeps the UI and behavior aligned with your `meta.variant: "multiSelect"`.

4. **Wire search + filters into the Orders table header row**

- Update [`src/components/tables/orders/table.tsx`](src/components/tables/orders/table.tsx):
- add `globalFilter` state + `onGlobalFilterChange`.
- keep `getFilteredRowModel()` (it handles both column filters + global filter).
- render toolbar row like:
- left: `DataTableSearch`, status filter dropdown, payment-status filter dropdown
- right: `DataTableViewOptions`, `OrdersTableActions`

5. **(Nice-to-have) Remove debug noise**

- Remove `console.log("TABLE", table)` from [`src/components/data-table/data-table-pagination.tsx`](src/components/data-table/data-table-pagination.tsx).

6. **Sanity checks**

- Verify:
- search input filters rows immediately
- selecting multiple statuses narrows results
- “reset” clears everything
- export still uses `getFilteredRowModel()` and respects filters (it already does)

## Notes / assumptions

- This will filter only within the currently loaded dataset (you currently load all orders on the page).
- Search will be implemented as a simple string match against `Order` fields (order number + customer/store/payment fields as available).

## Files to change/add

- Update: [`src/components/data-table/data-table-search.tsx`](src/components/data-table/data-table-search.tsx)
- Add: `src/components/data-table/data-table-multi-select-filter.tsx`
- Update: [`src/components/tables/orders/columns.tsx`](src/components/tables/orders/columns.tsx)
- Update: [`src/components/tables/orders/table.tsx`](src/components/tables/orders/table.tsx)
- Update (optional): [`src/components/data-table/data-table-pagination.tsx`](src/components/data-table/data-table-pagination.tsx)

## Implementation todos

- **dt-search**: implement controlled `DataTableSearch`
- **dt-multifilter**: add minimal multi-select filter dropdown component
- **orders-filterfn**: add multi-select-aware `filterFn` to `status`/`paymentStatus`
- **orders-toolbar**: add global search + two filters to Orders table header and wire table state
- **cleanup-pagination**: remove debug console.log from pagination
- **verify**: quick manual verification of search/filter/export interactions