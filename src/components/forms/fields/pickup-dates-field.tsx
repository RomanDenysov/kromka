"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Hint } from "@/components/shared/hint";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
};

export function PickupDatesField<T extends FieldValues>({
  name,
  label = "Dátumy vyzdvihnutia",
  description,
  className,
}: Props<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;

        // Filter invalid dates and sort
        const sortedDates = [...(field.value ?? [])]
          .filter((date) => date && !Number.isNaN(new Date(date).getTime()))
          .sort();

        const removeDate = (dateToRemove: string) => {
          field.onChange(
            field.value.filter((date: string) => date !== dateToRemove)
          );
        };

        const handleSelect = (dates: Date[] | undefined) => {
          if (!dates) {
            field.onChange([]);
            return;
          }
          const formatted = dates
            .map((date) => format(date, "yyyy-MM-dd"))
            .sort();
          field.onChange(formatted);
        };

        return (
          <Field
            className={cn("rounded-md border bg-card p-3", className)}
            data-invalid={isInvalid}
          >
            <FieldLabel>{label}</FieldLabel>
            <FieldDescription>
              {description ??
                "Toto nastavenie obmedzuje dátumy vyzdvihnutia pre danú kategóriu."}
              {sortedDates.length === 0 && (
                <span className="block text-muted-foreground">
                  Ak nie sú vybrané žiadne dátumy, všetky dni sú dostupné.
                </span>
              )}
            </FieldDescription>

            {sortedDates.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {sortedDates.map((date) => (
                  <Hint
                    key={date}
                    text={format(new Date(date), "EEEE - dd.MM.yyyy", {
                      locale: sk,
                    })}
                  >
                    <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1">
                      <CalendarIcon className="size-3.5 text-muted-foreground" />
                      <span className="truncate font-medium text-xs">
                        {format(new Date(date), "d. MMM yyyy", {
                          locale: sk,
                        })}
                      </span>
                      <Button
                        className="size-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeDate(date)}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  </Hint>
                ))}
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="mt-2 w-full"
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon className="size-4" />
                  {sortedDates.length > 0 ? "Upraviť dátumy" : "Pridať dátumy"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-fit">
                <DialogHeader>
                  <DialogTitle>Vyberte dátumy vyzdvihnutia</DialogTitle>
                  <DialogDescription>
                    Vyberte dátumy, ktoré budú dostupné pre danú kategóriu.
                  </DialogDescription>
                </DialogHeader>
                <Calendar
                  defaultMonth={
                    sortedDates.length > 0
                      ? new Date(sortedDates[0])
                      : new Date()
                  }
                  disabled={{ before: new Date() }}
                  mode="multiple"
                  numberOfMonths={2}
                  onSelect={handleSelect}
                  selected={sortedDates.map((date) => new Date(date))}
                  weekStartsOn={1}
                />
              </DialogContent>
            </Dialog>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
