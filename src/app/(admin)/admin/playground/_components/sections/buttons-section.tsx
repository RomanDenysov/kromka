"use client";

import type { VariantProps } from "class-variance-authority";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
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
  "brand",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const satisfies readonly NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>[];

const SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "xl",
] as const satisfies readonly NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>[];

export function ButtonsSection() {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("default");
  const [size, setSize] = useState<(typeof SIZES)[number]>("default");

  return (
    <PlaygroundSection
      description="Button, buttonVariants — interaktívny výber variantu a veľkosti."
      id="buttons"
      title="Tlačidlá"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs">Variant</p>
            <Select
              onValueChange={(v) => setVariant(v as (typeof VARIANTS)[number])}
              value={variant}
            >
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[140px]">
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
          <Button size={size} variant={variant}>
            Ukážkové tlačidlo
          </Button>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Všetky varianty (default veľkosť)
          </p>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Glass (na tmavom pozadí)
          </p>
          <div className="rounded-md bg-linear-to-br from-neutral-800 to-neutral-950 p-6">
            <Button variant="glass">Glass</Button>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Ikony
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="icon-xs" variant="outline">
              <BoldIcon />
            </Button>
            <Button size="icon-sm" variant="outline">
              <ItalicIcon />
            </Button>
            <Button size="icon" variant="outline">
              <UnderlineIcon />
            </Button>
            <Button size="icon-lg" variant="outline">
              <BoldIcon />
            </Button>
            <Button size="icon-xl" variant="outline">
              <BoldIcon />
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Button group
          </p>
          <ButtonGroup>
            <Button size="sm" variant="outline">
              Bold
            </Button>
            <Button size="sm" variant="outline">
              Italic
            </Button>
            <ButtonGroupSeparator />
            <ButtonGroupText>Formátovanie</ButtonGroupText>
          </ButtonGroup>
        </div>
      </div>
    </PlaygroundSection>
  );
}
