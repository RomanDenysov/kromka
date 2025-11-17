import { useDataTableContext } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DataTableSearchProps = {
  columnId?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function DataTableSearch({
  columnId,
  placeholder = "Search...",
  className,
  value: controlledValue,
  onChange: controlledOnChange,
}: DataTableSearchProps) {
  const table = useDataTableContext();

  // Если переданы контролируемые значения, используем их
  if (controlledValue !== undefined && controlledOnChange) {
    return (
      <Input
        className={cn("max-w-xs", className)}
        onChange={(e) => controlledOnChange(e.target.value)}
        placeholder={placeholder}
        value={controlledValue}
      />
    );
  }

  // Иначе работаем с table API
  if (columnId) {
    const column = table.getColumn(columnId);
    return (
      <Input
        className={cn("max-w-xs", className)}
        onChange={(e) => column?.setFilterValue(e.target.value)}
        placeholder={placeholder}
        value={(column?.getFilterValue() as string) ?? ""}
      />
    );
  }

  // Global search
  return (
    <Input
      className={cn("max-w-xs", className)}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      placeholder={placeholder}
      value={table.getState().globalFilter ?? ""}
    />
  );
}
