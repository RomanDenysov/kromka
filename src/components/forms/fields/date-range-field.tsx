"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  className?: string;
};

export function DateRangeField<T extends FieldValues>({
  name,
  label,
  className,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const range = field.value as DateRange;
        const isInvalid = fieldState.invalid;

        return (
          <Field
            className={className}
            data-invalid={isInvalid}
            orientation="horizontal"
          >
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="w-56 justify-between font-normal"
                  type="button"
                  variant="outline"
                >
                  {range?.from
                    ? `${format(range.from, "dd.MM.yyyy")}${range.to && range.to !== range.from ? ` - ${format(range.to, "dd.MM.yyyy")}` : ""}`
                    : "Vyberte obdobie"}
                  <CalendarIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto overflow-hidden p-0"
              >
                <Calendar
                  captionLayout="dropdown"
                  mode="range"
                  onSelect={(r) => field.onChange(r ?? range)}
                  selected={range}
                />
              </PopoverContent>
            </Popover>
          </Field>
        );
      }}
    />
  );
}
