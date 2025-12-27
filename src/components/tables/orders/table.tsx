"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableMultiSelectFilter } from "@/components/data-table/data-table-multi-select-filter";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import {
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/actions/orders";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/lib/queries/orders";
import { columns } from "./columns";
import { OrdersTableActions } from "./table-actions";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 16,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const memoizedOrders = useMemo(() => orders, [orders]);

  const table = useReactTable<Order>({
    data: memoizedOrders,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue || filterValue.trim() === "") {
        return true;
      }

      const searchValue = filterValue.toLowerCase();
      const order = row.original;

      // Search in order number
      if (order.orderNumber?.toLowerCase().includes(searchValue)) {
        return true;
      }

      // Search in customer info
      const customerName = order.createdBy?.name ?? order.customerInfo?.name;
      const customerEmail = order.createdBy?.email ?? order.customerInfo?.email;
      const customerPhone = order.createdBy?.phone ?? order.customerInfo?.phone;

      if (
        customerName?.toLowerCase().includes(searchValue) ||
        customerEmail?.toLowerCase().includes(searchValue) ||
        customerPhone?.toLowerCase().includes(searchValue)
      ) {
        return true;
      }

      // Search in store name
      if (order.store?.name?.toLowerCase().includes(searchValue)) {
        return true;
      }

      return false;
    },
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      sorting,
      rowSelection,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    meta: {
      onStatusChange: async (id: string, status: OrderStatus) => {
        await updateOrderStatusAction({ orderId: id, status });
      },
      onPaymentStatusChange: async (id: string, status: PaymentStatus) => {
        await updateOrderPaymentStatusAction({ orderId: id, status });
      },
    },
  });

  // Derive selected IDs from rowSelection state (reactive)
  const selectedOrderIds = useMemo(
    () => Object.keys(rowSelection),
    [rowSelection]
  );

  // Derive orders from table state (memoized to avoid render-time side effects)
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps are state values that affect filtering
  const filteredOrders = useMemo(
    () => table.getFilteredRowModel().rows.map((r) => r.original),
    [memoizedOrders, columnFilters, globalFilter]
  );

  const selectedOrders = useMemo(
    () =>
      selectedOrderIds
        .map((id) => filteredOrders.find((o) => o.id === id))
        .filter((o): o is Order => o !== undefined),
    [selectedOrderIds, filteredOrders]
  );

  const resetSelection = () => {
    setRowSelection({});
  };

  const statusOptions = Object.entries(ORDER_STATUS_LABELS).map(
    ([value, label]) => ({
      label,
      value,
    })
  );

  const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
    ([value, label]) => ({
      label,
      value,
    })
  );

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <DataTableSearch
            onSearch={setGlobalFilter}
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
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <OrdersTableActions
            filteredOrders={filteredOrders}
            resetSelection={resetSelection}
            selectedOrders={selectedOrders}
          />
        </div>
      </div>
    </DataTable>
  );
}
