"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import type { Product } from "./columns";

export function Header({ table }: { table: Table<Product> }) {
  return (
    <div className="flex items-center justify-between p-4">
      <Input
        className="max-w-xs"
        onChange={(event) =>
          table?.getColumn("name")?.setFilterValue(event.target.value)
        }
        placeholder="Hľadať produkt..."
        value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
        volume="sm"
      />
    </div>
  );
}
