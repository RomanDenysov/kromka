"use client";

import { format, parse } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { CalendarIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useFieldContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DaySchedule } from "@/db/types";

type ExceptionsRecord = Record<string, DaySchedule>;

type Props = {
  label?: string;
};

/**
 * Field component for managing store schedule exceptions.
 * Allows admins to add special dates with custom hours or mark as closed.
 */
export function StoreExceptionsField({ label }: Props) {
  const field = useFieldContext<ExceptionsRecord | undefined>();
  const exceptions = field.state.value ?? {};
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("18:00");
  const [isClosed, setIsClosed] = useState(false);

  const sortedDates = Object.keys(exceptions).sort();

  const handleAddException = useCallback(() => {
    if (!newDate) {
      return;
    }

    const dateKey = format(newDate, "yyyy-MM-dd");
    const schedule: DaySchedule = isClosed
      ? "closed"
      : { start: newStart, end: newEnd };

    field.handleChange({
      ...exceptions,
      [dateKey]: schedule,
    });

    // Reset form
    setNewDate(undefined);
    setNewStart("08:00");
    setNewEnd("18:00");
    setIsClosed(false);
    setIsAdding(false);
  }, [newDate, isClosed, newStart, newEnd, exceptions, field]);

  const handleRemoveException = useCallback(
    (dateKey: string) => {
      const updated = { ...exceptions };
      delete updated[dateKey];
      field.handleChange(updated);
    },
    [exceptions, field]
  );

  const formatDateKey = (dateKey: string) => {
    const date = parse(dateKey, "yyyy-MM-dd", new Date());
    return format(date, "d. MMMM yyyy", { locale: sk });
  };

  const formatSchedule = (schedule: DaySchedule) => {
    if (schedule === "closed" || schedule === null) {
      return "Zatvorené";
    }
    return `${schedule.start} - ${schedule.end}`;
  };

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldTitle>{label}</FieldTitle>}
      <FieldContent className="space-y-2">
        {/* Existing exceptions list */}
        {sortedDates.length > 0 && (
          <div className="space-y-1">
            {sortedDates.map((dateKey) => {
              const schedule = exceptions[dateKey];
              return (
                <div
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm"
                  key={dateKey}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {formatDateKey(dateKey)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatSchedule(schedule)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleRemoveException(dateKey)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new exception form */}
        {isAdding ? (
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Nová výnimka</span>
              <Button
                onClick={() => setIsAdding(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            {/* Date picker */}
            <Field orientation="horizontal">
              <FieldLabel className="w-20">Dátum</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-start font-normal"
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <CalendarIcon className="size-4" />
                    {newDate
                      ? format(newDate, "d. MMMM yyyy", { locale: sk })
                      : "Vyberte dátum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto overflow-hidden p-0"
                >
                  <Calendar
                    locale={sk}
                    mode="single"
                    onSelect={setNewDate}
                    selected={newDate}
                    weekStartsOn={1}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/* Closed toggle */}
            <Field orientation="horizontal">
              <FieldLabel className="w-20">Zatvorené</FieldLabel>
              <Button
                className="w-full"
                onClick={() => setIsClosed(!isClosed)}
                size="sm"
                type="button"
                variant={isClosed ? "default" : "outline"}
              >
                {isClosed ? "Áno - zatvorené" : "Nie - vlastné hodiny"}
              </Button>
            </Field>

            {/* Time inputs (only if not closed) */}
            {!isClosed && (
              <div className="flex gap-2">
                <Field className="flex-1" orientation="horizontal">
                  <FieldLabel className="w-20">Od</FieldLabel>
                  <Input
                    className="flex-1"
                    onChange={(e) => setNewStart(e.target.value)}
                    type="time"
                    value={newStart}
                  />
                </Field>
                <Field className="flex-1" orientation="horizontal">
                  <FieldLabel className="w-20">Do</FieldLabel>
                  <Input
                    className="flex-1"
                    onChange={(e) => setNewEnd(e.target.value)}
                    type="time"
                    value={newEnd}
                  />
                </Field>
              </div>
            )}

            {/* Add button */}
            <Button
              className="w-full"
              disabled={!newDate}
              onClick={handleAddException}
              size="sm"
              type="button"
            >
              Pridať výnimku
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => setIsAdding(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon className="size-4" />
            Pridať výnimku
          </Button>
        )}
      </FieldContent>
    </Field>
  );
}
