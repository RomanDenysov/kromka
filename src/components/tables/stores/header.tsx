"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import type { Store } from "@/types/store";

export function Header({ table }: { table: Table<Store> }) {
  return (
    <div className="flex items-center justify-between p-4">
      <Input
        className="max-w-xs"
        onChange={(event) =>
          table?.getColumn("name")?.setFilterValue(event.target.value)
        }
        placeholder="Hľadať obchod..."
        value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
        volume="sm"
      />
    </div>
  );
}
