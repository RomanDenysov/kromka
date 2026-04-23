"use client";

import type { VariantProps } from "class-variance-authority";
import { useState } from "react";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { DistanceBadge } from "@/components/ui/distance-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaygroundSection } from "../playground-section";

const VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "success",
  "outline",
] as const satisfies readonly NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>[];

const SIZES = ["xs", "sm", "default"] as const satisfies readonly NonNullable<
  VariantProps<typeof badgeVariants>["size"]
>[];

export function BadgesSection() {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("default");
  const [size, setSize] = useState<(typeof SIZES)[number]>("default");

  return (
    <PlaygroundSection
      description="Badge + DistanceBadge (mapovanie predajní)."
      id="badges"
      title="Odznaky"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs">Variant</p>
            <Select
              onValueChange={(v) => setVariant(v as (typeof VARIANTS)[number])}
              value={variant}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANTS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs">Veľkosť</p>
            <Select
              onValueChange={(v) => setSize(v as (typeof SIZES)[number])}
              value={size}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge size={size} variant={variant}>
            Stav
          </Badge>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Všetky varianty
          </p>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            DistanceBadge
          </p>
          <div className="flex flex-wrap gap-3">
            <DistanceBadge distance={0.4} />
            <DistanceBadge distance={2.5} />
            <DistanceBadge distance={12} variant="light" />
          </div>
        </div>
      </div>
    </PlaygroundSection>
  );
}
