"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search) {
        next.set("search", search);
      } else {
        next.delete("search");
      }
      router.replace(`/admin/ingredients?${next.toString()}` as never);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, params, router]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.replace(`/admin/ingredients?${next.toString()}` as never);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="absolute top-2.5 left-2 size-4 text-muted-foreground" />
        <Input
          className="w-64 pl-8"
          onChange={(e) => setSearch(e.target.value)}
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
