"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/users";

export function Header({ table }: { table: Table<User> }) {
  return (
    <div className="flex items-center justify-between p-4">
      <Input
        className="max-w-xs"
        onChange={(event) =>
          table?.getColumn("email")?.setFilterValue(event.target.value)
        }
        placeholder="Search..."
        value={(table?.getColumn("email")?.getFilterValue() as string) ?? ""}
      />
    </div>
  );
}
