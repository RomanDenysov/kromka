"use client";

import type { Table } from "@tanstack/react-table";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type DataTableMultiSelectFilterProps<TData> = {
  table: Table<TData>;
  columnId: string;
  title: string;
  options: Option[];
};

export function DataTableMultiSelectFilter<TData>({
  table,
  columnId,
  title,
  options,
}: DataTableMultiSelectFilterProps<TData>) {
  const column = table.getColumn(columnId);
  const filterValue = (column?.getFilterValue() as string[] | undefined) ?? [];

  const handleSelect = (value: string) => {
    const newFilterValue = filterValue.includes(value)
      ? filterValue.filter((v) => v !== value)
      : [...filterValue, value];

    column?.setFilterValue(
      newFilterValue.length > 0 ? newFilterValue : undefined
    );
  };

  const handleClear = () => {
    column?.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border-dashed" size="sm" variant="outline">
          {title}
          {filterValue.length > 0 && (
            <Badge
              className="ml-2 rounded-sm px-1 font-normal"
              variant="secondary"
            >
              {filterValue.length}
            </Badge>
          )}
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Hľadať ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenašli sa žiadne výsledky.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = filterValue.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {filterValue.length > 0 && (
              <CommandGroup>
                <CommandItem onSelect={handleClear}>
                  <span className="text-muted-foreground">Vymazať filtre</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
