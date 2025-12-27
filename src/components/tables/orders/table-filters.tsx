"use client";

import type { Table } from "@tanstack/react-table";
import {
  DataTableDateRangeFilter,
  type DateRangeFilterValue,
} from "@/components/data-table/data-table-date-range-filter";
import { DataTableMultiSelectFilter } from "@/components/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/lib/queries/orders";

type OrdersTableFiltersProps = {
  table: Table<Order>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
};

export function OrdersTableFilters({
  table,
  globalFilter,
  onGlobalFilterChange,
}: OrdersTableFiltersProps) {
  const statusOptions = Object.entries(ORDER_STATUS_LABELS).map(
    ([value, label]) => ({ label, value })
  );

  const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
    ([value, label]) => ({ label, value })
  );

  const column = table.getColumn("pickupDate");

  return (
    <div className="flex items-center gap-2">
      <DataTableSearch
        onSearch={onGlobalFilterChange}
        placeholder="Hľadať objednávky..."
        value={globalFilter}
      />
      <DataTableMultiSelectFilter
        columnId="status"
        options={statusOptions}
        table={table}
        title="Stav"
      />
      <DataTableMultiSelectFilter
        columnId="paymentStatus"
        options={paymentStatusOptions}
        table={table}
        title="Stav platby"
      />
      <DataTableDateRangeFilter
        onChange={(val) => column?.setFilterValue(val)}
        title="Dátum vyzdvihnutia"
        value={column?.getFilterValue() as DateRangeFilterValue | undefined}
      />
    </div>
  );
}
