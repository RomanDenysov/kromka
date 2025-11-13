/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers */
"use client";

import { ArrowRightIcon, XIcon } from "lucide-react";
import { useCallback } from "react";
import { useFieldContext } from "@/components/shared/form";
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

type Props = {
  label?: string;
  description?: string;
};

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

export function TimeField({ label, description }: Props) {
  const field = useFieldContext<DaySchedule>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const schedule = field.state.value;
  const isClosed = schedule?.isClosed ?? false;
  const period = schedule?.period ?? null;

  const ensurePeriod = useCallback(
    (current: DaySchedule) => ({
      open: current.period?.open ?? DEFAULT_OPEN_TIME,
      close: current.period?.close ?? DEFAULT_CLOSE_TIME,
    }),
    []
  );

  const handlePeriodChange = useCallback(
    (key: keyof TimeSlot, value: string) => {
      field.handleChange((previous) => {
        const nextPeriod = {
          ...ensurePeriod(previous),
          [key]: value,
        };

        return {
          ...previous,
          period: nextPeriod,
        };
      });
    },
    [ensurePeriod, field]
  );

  const handleClose = useCallback(() => {
    field.handleChange((previous) => ({
      ...previous,
      isClosed: true,
      period: null,
    }));
  }, [field]);

  const handleOpen = useCallback(() => {
    field.handleChange((previous) => ({
      ...previous,
      isClosed: false,
      period: ensurePeriod(previous),
    }));
  }, [ensurePeriod, field]);

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
            {description && <FieldDescription>{description}</FieldDescription>}
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
                onValueChange={(value) => handlePeriodChange("open", value)}
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
                onValueChange={(value) => handlePeriodChange("close", value)}
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
              <Button onClick={handleClose} size="icon-xs" variant="ghost">
                <XIcon />
              </Button>
            </>
          )}
        </Field>
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </>
  );
}
