"use client";

import { ArrowRightIcon, XIcon } from "lucide-react";
import { useCallback } from "react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

type TimeSlot = {
  open: string;
  close: string;
};

type DaySchedule = {
  period: TimeSlot | null;
  isClosed: boolean;
};

const DEFAULT_OPEN_TIME = "08:00";
const DEFAULT_CLOSE_TIME = "18:00";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4)
    .toString()
    .padStart(2, "0");
  const minute = ((index % 4) * 15).toString().padStart(2, "0");
  return `${hour}:${minute}`;
});

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
};

export function TimeField<T extends FieldValues>({
  name,
  label,
  description,
}: Props<T>) {
  const { control } = useFormContext<T>();

  const ensurePeriod = useCallback(
    (current: DaySchedule) => ({
      open: current.period?.open ?? DEFAULT_OPEN_TIME,
      close: current.period?.close ?? DEFAULT_CLOSE_TIME,
    }),
    []
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;
        const schedule = field.value as DaySchedule;
        const isClosed = schedule?.isClosed ?? false;
        const period = schedule?.period ?? null;

        const handlePeriodChange = (key: keyof TimeSlot, value: string) => {
          const nextPeriod = {
            ...ensurePeriod(schedule),
            [key]: value,
          };

          field.onChange({
            ...schedule,
            period: nextPeriod,
          });
        };

        const handleClose = () => {
          field.onChange({
            ...schedule,
            isClosed: true,
            period: null,
          });
        };

        const handleOpen = () => {
          field.onChange({
            ...schedule,
            isClosed: false,
            period: ensurePeriod(schedule),
          });
        };

        return (
          <>
            <div className="w-full max-w-md rounded-md border bg-card p-3">
              <Field data-invalid={isInvalid} orientation="horizontal">
                <FieldContent>
                  {label && (
                    <FieldLabel
                      className="text-muted-foreground"
                      htmlFor={field.name}
                    >
                      {label}
                    </FieldLabel>
                  )}
                  {description && (
                    <FieldDescription>{description}</FieldDescription>
                  )}
                </FieldContent>
                {isClosed ? (
                  <Button onClick={handleOpen} size="xs" variant="ghost">
                    Otvorené
                    <ArrowRightIcon />
                  </Button>
                ) : (
                  <>
                    <Select
                      disabled={isClosed}
                      onValueChange={(value) =>
                        handlePeriodChange("open", value)
                      }
                      value={period?.open ?? undefined}
                    >
                      <SelectTrigger
                        className="w-26 min-w-0 font-normal focus:ring-0 focus:ring-offset-0"
                        size="xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-26 min-w-0">
                        <ScrollArea className="h-60">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <Select
                      disabled={isClosed}
                      onValueChange={(value) =>
                        handlePeriodChange("close", value)
                      }
                      value={period?.close ?? undefined}
                    >
                      <SelectTrigger
                        className="w-26 min-w-0 font-normal focus:ring-0 focus:ring-offset-0"
                        size="xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-26 min-w-0">
                        <ScrollArea className="h-60">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleClose}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <XIcon />
                    </Button>
                  </>
                )}
              </Field>
            </div>
            {isInvalid && <FieldError errors={[fieldState.error]} />}
          </>
        );
      }}
    />
  );
}
