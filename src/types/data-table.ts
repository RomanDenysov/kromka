/** biome-ignore-all lint/style/useConsistentTypeDefinitions: Module augmentation requires interface */
import type { RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { DataTableConfig } from "@/widgets/data-table/config/data-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys;
    [key: string]: unknown;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    icon?: LucideIcon;
    label?: string;
    options?: Option[];
    placeholder?: string;
    range?: [number, number];
    unit?: string;
    variant?: FilterVariant;
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
