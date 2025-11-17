/** biome-ignore-all lint/style/noNonNullAssertion: Need to ignore this */
/** biome-ignore-all lint/suspicious/noExplicitAny: Need to ignore this */
/** biome-ignore-all lint/suspicious/noNonNullAssertedOptionalChain: Need to ignore this */
"use client";

import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  type FilterFn,
  type SortingFn,
  sortingFns,
} from "@tanstack/react-table";
import { type InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });
  return itemRank.passed;
};

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

type DataTableSearchProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">;

export function DataTableSearch({
  value: initialValue,
  onChange,
  debounce = 500,
  placeholder = "Hľadať...",
  className,
  ...props
}: DataTableSearchProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);
  return (
    <Input
      {...props}
      aria-label="Search"
      className={cn("max-w-60", className)}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      volume="sm"
    />
  );
}
