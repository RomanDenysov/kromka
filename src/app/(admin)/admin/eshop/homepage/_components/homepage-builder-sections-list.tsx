"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { HomepageBlockType } from "@/db/schema";
import type { AdminHomepageSection } from "@/features/homepage/api/queries";
import { cn } from "@/lib/utils";

interface Props {
  isPending: boolean;
  labels: Record<HomepageBlockType, string>;
  onDelete: (sectionId: string) => void;
  onDuplicate: (sectionId: string) => void;
  onEdit: (sectionId: string) => void;
  onReorder: (orderedSectionIds: string[]) => void;
  onToggle: (sectionId: string, isEnabled: boolean) => void;
  sections: AdminHomepageSection[];
  sourceLabels: Record<string, string>;
}

export function HomepageBuilderSectionsList({
  sections,
  labels,
  sourceLabels,
  isPending,
  onReorder,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const ordered = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) {
      return;
    }
    const next = ordered.slice();
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onReorder(next.map((section) => section.id));
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b bg-muted/40 px-4 py-2 font-medium text-muted-foreground text-xs">
        <span>Poradie</span>
        <span>Sekcia</span>
        <span>Náhľad</span>
        <span className="text-right">Akcie</span>
      </div>
      <ul className="divide-y">
        {ordered.map((section, index) => {
          const isCarousel = section.blockType === "carousel";
          const label =
            isCarousel && section.title
              ? section.title
              : labels[section.blockType];

          return (
            <li
              className={cn(
                "grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3",
                !section.isEnabled && "opacity-60"
              )}
              key={section.id}
            >
              <div className="flex flex-col">
                <button
                  aria-label="Posunúť hore"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === 0 || isPending}
                  onClick={() => moveSection(index, -1)}
                  type="button"
                >
                  <ArrowUpIcon className="size-3.5" />
                </button>
                <button
                  aria-label="Posunúť dolu"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={index === ordered.length - 1 || isPending}
                  onClick={() => moveSection(index, 1)}
                  type="button"
                >
                  <ArrowDownIcon className="size-3.5" />
                </button>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-sm">{label}</p>
                  <Badge variant="outline">
                    {isCarousel
                      ? (sourceLabels[section.sourceType ?? ""] ?? "Carousel")
                      : labels[section.blockType]}
                  </Badge>
                  {section.isEnabled ? null : (
                    <Badge variant="secondary">Vypnuté</Badge>
                  )}
                </div>
                {isCarousel && section.categoryName ? (
                  <p className="text-muted-foreground text-xs">
                    Kategória: {section.categoryName}
                  </p>
                ) : null}
              </div>

              <div className="text-muted-foreground text-xs">
                {isCarousel
                  ? `${section.previewProducts.length} produktov`
                  : "—"}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Switch
                  checked={section.isEnabled}
                  disabled={isPending}
                  onCheckedChange={(checked) => onToggle(section.id, checked)}
                />
                {isCarousel ? (
                  <>
                    <Button
                      aria-label="Upraviť carousel"
                      disabled={isPending}
                      onClick={() => onEdit(section.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      aria-label="Duplikovať carousel"
                      disabled={isPending}
                      onClick={() => onDuplicate(section.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <CopyIcon className="size-4" />
                    </Button>
                    <Button
                      aria-label="Odstrániť carousel"
                      disabled={isPending}
                      onClick={() => onDelete(section.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
