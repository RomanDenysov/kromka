/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers */
"use client";

import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkDay } from "@/db/schema/stores";

type Props = {
  label?: string;
  description?: string;
};

export function TimeField({ label, description }: Props) {
  const field = useFieldContext<WorkDay>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className="w-full max-w-md rounded-md border p-3">
      <Field data-invalid={isInvalid} orientation="horizontal">
        <FieldContent>
          {label && (
            <FieldLabel className="text-muted-foreground" htmlFor={field.name}>
              {label}
            </FieldLabel>
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
        <Select
          defaultValue={field.state.value?.open || "08:00"}
          onValueChange={(value) =>
            field.handleChange((state) => ({ ...state, open: value }))
          }
          value={field.state.value?.open || "08:00"}
        >
          <SelectTrigger className="w-26 min-w-0 font-normal focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-26 min-w-0">
            <ScrollArea className="h-60">
              {Array.from({ length: 96 }).map((_, i) => {
                const hour = Math.floor(i / 4)
                  .toString()
                  .padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                return (
                  <SelectItem key={i.toString()} value={`${hour}:${minute}`}>
                    {hour}:{minute}
                  </SelectItem>
                );
              })}
            </ScrollArea>
          </SelectContent>
        </Select>
        <Select
          defaultValue={field.state.value?.close || "18:00"}
          onValueChange={(value) =>
            field.handleChange((state) => ({ ...state, close: value }))
          }
          value={field.state.value?.close || "18:00"}
        >
          <SelectTrigger className="w-26 min-w-0 font-normal focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-26 min-w-0">
            <ScrollArea className="h-60">
              {Array.from({ length: 96 }).map((_, i) => {
                const hour = Math.floor(i / 4)
                  .toString()
                  .padStart(2, "0");
                const minute = ((i % 4) * 15).toString().padStart(2, "0");
                return (
                  <SelectItem key={i.toString()} value={`${hour}:${minute}`}>
                    {hour}:{minute}
                  </SelectItem>
                );
              })}
            </ScrollArea>
          </SelectContent>
        </Select>

        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    </div>
  );
}
