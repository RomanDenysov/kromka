"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DataTableSearch({
  value,
  onSearch,
  placeholder = "Hľadať...",
  className,
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedSearch = useDebouncedCallback(onSearch, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("max-w-sm", className)}>
      <Input
        className="h-8"
        onChange={(e) => {
          const newValue = e.target.value;
          setLocalValue(newValue);
          debouncedSearch(newValue);
        }}
        placeholder={placeholder}
        value={localValue}
      />
    </div>
  );
}
