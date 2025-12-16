/** biome-ignore-all lint/style/useConsistentTypeDefinitions: Module augmentation requires interface */
import type { RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { DataTableConfig } from "@/components/data-table/config/data-table";

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: false positive
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys;
    [key: string]: unknown;
  }

  // biome-ignore lint/correctness/noUnusedVariables: false positive
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: LucideIcon;
  }
}

export type QueryKeys = {
  page: string;
  perPage: string;
  sort: string;
  filters: string;
  join: string;
};

export type Option = {
  label: string;
  value: string;
  count?: number;
  icon?: LucideIcon;
};

export type FilterVariant = DataTableConfig["filterVariants"][number];
