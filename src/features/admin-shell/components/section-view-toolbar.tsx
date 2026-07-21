"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildParsers } from "../search-params";
import type { SectionConfig } from "../types";

interface SectionViewToolbarProps {
  className?: string;
  section: SectionConfig;
}

export function SectionViewToolbar({
  section,
  className,
}: SectionViewToolbarProps) {
  const views = section.views ?? [];
  const parsers = buildParsers(section);
  const [params, setParams] = useQueryStates(parsers, { shallow: false });

  if (views.length < 2) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-end gap-1 px-3 pt-3", className)}
    >
      <Button
        aria-label="Tabuľka"
        onClick={() => setParams({ view: "table" })}
        size="icon-sm"
        variant={params.view === "table" ? "secondary" : "ghost"}
      >
        <ListIcon />
      </Button>
      <Button
        aria-label="Mriežka"
        onClick={() => setParams({ view: "grid" })}
        size="icon-sm"
        variant={params.view === "grid" ? "secondary" : "ghost"}
      >
        <LayoutGridIcon />
      </Button>
    </div>
  );
}
