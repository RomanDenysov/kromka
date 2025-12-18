"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
  value: number;
  max: number;
  min: number;
  onChange: (value: number) => void;
};

export function QuantityInput({ id, value, max, min, onChange }: Props) {
  return (
    <ButtonGroup
      aria-label="Quantity setter"
      className="w-fit"
      orientation="horizontal"
    >
      <Button
        className="size-6"
        disabled={value === min}
        onClick={() => onChange(value - 1)}
        size="icon-xs"
        type="button"
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <Input
        className="h-6 w-fit max-w-8 text-wrap bg-background text-center font-mono"
        id={id}
        max={max}
        min={min}
        name={id}
        onChange={(e) => onChange(Number(e.target.value))}
        pattern="[0-9]*"
        type="text"
        value={value}
        volume="xs"
      />

      <Button
        className="size-6"
        disabled={value === max}
        onClick={() => onChange(value + 1)}
        size="icon-xs"
        type="button"
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </ButtonGroup>
  );
}
