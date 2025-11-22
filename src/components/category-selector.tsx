import { useQuery } from "@tanstack/react-query";
import { CheckIcon, PlusCircleIcon, XIcon } from "lucide-react";
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
import { useTRPC } from "@/trpc/client";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  const trpc = useTRPC();
  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    trpc.admin.categories.list.queryOptions()
  );

  if (isLoadingCategories) {
    return <Skeleton className="h-12 w-full rounded-md" />;
  }

  return (
    <div className="flex items-start justify-start gap-2 rounded-md border p-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {value.length > 0 ? (
          value.map((categoryId) => (
            <Badge key={categoryId} size="sm" variant="outline">
              {categories?.find((category) => category.id === categoryId)?.name}
              <button
                onClick={() =>
                  onChange(value.filter((id) => id !== categoryId))
                }
                type="button"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))
        ) : (
          <Badge size="sm" variant="outline">
            Vyberte kategórie...
          </Badge>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button role="combobox" size="icon-sm" variant="ghost">
            <PlusCircleIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" side="right">
          <Command className="w-full">
            <CommandInput placeholder="Vyberte kategórie..." />
            <CommandList>
              <CommandEmpty>Nenašli sa žiadne kategórie.</CommandEmpty>
              <CommandGroup>
                {categories?.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={(currentValue) => {
                      onChange(
                        value?.includes(currentValue)
                          ? value?.filter((id) => id !== currentValue)
                          : [...value, currentValue as string]
                      );
                    }}
                    value={category.id}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.includes(category.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
