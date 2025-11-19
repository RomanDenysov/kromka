import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useFieldContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  label?: string;
  className?: string;
};

export function DateRangeField({ label, className }: Props) {
  const field = useFieldContext<DateRange>();

  const range = field.state.value;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

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
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            captionLayout="dropdown"
            mode="range"
            onSelect={(r) => {
              field.handleChange((previous) => r ?? previous);
            }}
            selected={range}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
