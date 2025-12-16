import type { Table } from "@tanstack/react-table";
import { CheckIcon, Settings2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type DataTableViewOptionsProps<TData> = ComponentProps<
  typeof PopoverContent
> & {
  table: Table<TData>;
  disabled?: boolean;
};

export function DataTableViewOptions<TData>({
  table,
  disabled,
  ...props
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Toggle columns"
          className="ml-auto hidden font-normal lg:flex"
          disabled={disabled}
          role="combobox"
          size="sm"
          variant="outline"
        >
          <Settings2Icon className="text-muted-foreground" />
          Skryť/Zobraziť
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" {...props} align="end">
        <Command>
          <CommandInput placeholder="Hľadať stĺpce..." />
          <CommandList>
            <CommandEmpty>Nenašli sa žiadne stĺpce.</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                >
                  <span className="truncate">
                    {column.columnDef.meta?.label ?? column.id}
                  </span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      column.getIsVisible() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
