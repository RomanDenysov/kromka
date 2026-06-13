"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * URL-driven filter row for the ingredients list. Search debounces and
 * pushes ?search=... ; active and missing are normal selects.
 */
export function IngredientsListFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const active = params.get("active") ?? "all";
  const missing = params.get("missing") ?? "all";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = (next: URLSearchParams) => {
    router.replace(`/admin/production/ingredients?${next.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      pushParams(next);
    }, 300);
  };

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    pushParams(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="absolute top-2.5 left-2 size-4 text-muted-foreground" />
        <Input
          className="w-64 pl-8"
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Hľadať surovinu (muka, mlieko...)"
          value={search}
        />
      </div>
      <Select onValueChange={(v) => setParam("active", v)} value={active}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Stav" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Všetky</SelectItem>
          <SelectItem value="true">Aktívne</SelectItem>
          <SelectItem value="false">Neaktívne</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(v) => setParam("missing", v)} value={missing}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Chýbajúce údaje" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Všetky</SelectItem>
          <SelectItem value="price">Bez ceny</SelectItem>
          <SelectItem value="nutrition">Bez nutrície</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
