/** biome-ignore-all lint/style/noMagicNumbers: Ignore it for now */
"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import {
  CheckIcon,
  ClipboardPasteIcon,
  CopyIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Hint } from "@/components/shared/hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StoreSchedule } from "@/db/schema";
import { cn } from "@/lib/utils";

type DaySchedule = { start: string; end: string } | "closed" | null;

const WEEKDAYS = [
  { key: "monday", label: "Pondelok", short: "Pn" },
  { key: "tuesday", label: "Utorok", short: "Ut" },
  { key: "wednesday", label: "Streda", short: "St" },
  { key: "thursday", label: "Štvrtok", short: "Št" },
  { key: "friday", label: "Piatok", short: "Pt" },
  { key: "saturday", label: "Sobota", short: "So" },
  { key: "sunday", label: "Nedeľa", short: "Nd" },
] as const;

type WeekdayKey = (typeof WEEKDAYS)[number]["key"];

type Props = {
  value: StoreSchedule;
  onChange: (value: StoreSchedule) => void;
};

export function TestHoursField({ value, onChange }: Props) {
  const [selectedDay, setSelectedDay] = useState<WeekdayKey | null>(null);

  const updateDay = (day: WeekdayKey, schedule: DaySchedule) => {
    onChange({
      ...value,
      regularHours: {
        ...value.regularHours,
        [day]: schedule,
      },
    });
  };

  const copyToAllWeekdays = (schedule: DaySchedule) => {
    const weekdayKeys = WEEKDAYS.slice(0, 5).map((d) => d.key);
    const newHours = { ...value.regularHours };
    // biome-ignore lint/complexity/noForEach: Ignore it for now
    weekdayKeys.forEach((day) => {
      newHours[day] = schedule;
    });
    onChange({ ...value, regularHours: newHours });
  };

  const copyToWeekend = (schedule: DaySchedule) => {
    onChange({
      ...value,
      regularHours: {
        ...value.regularHours,
        saturday: schedule,
        sunday: schedule,
      },
    });
  };

  const handlePaste = (targetDay: WeekdayKey) => {
    if (!selectedDay) {
      return;
    }
    const sourceSchedule = value.regularHours[selectedDay];
    updateDay(targetDay, sourceSchedule ?? "closed");
  };

  const regularHours = WEEKDAYS.map((day) => {
    const schedule = value.regularHours[day.key] ?? "closed";
    return {
      label: day.short,
      key: day.key,
      schedule,
      isOpen: schedule !== "closed" && schedule !== null,
    };
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full cursor-pointer overflow-x-auto rounded-md border p-2 transition-colors hover:bg-muted/50">
          <div className="grid grid-cols-7 gap-1">
            {regularHours.map((day) => (
              <div
                className={cn(
                  "flex min-h-14 flex-col items-center justify-between rounded border p-1 text-center text-[10px] sm:text-xs",
                  day.isOpen
                    ? "border-primary/20 bg-primary/5"
                    : "bg-muted/50 opacity-70"
                )}
                key={day.key}
              >
                <span className="font-medium">{day.label}</span>
                {day.isOpen && typeof day.schedule !== "string" ? (
                  <div className="flex flex-col text-muted-foreground leading-tight">
                    <span>{day.schedule.start}</span>
                    <span>{day.schedule.end}</span>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <XIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-xl space-y-5">
        <DialogHeader>
          <DialogTitle>Nastavenie otváracích hodín</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-sm">Rychlé nastavenie</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() =>
                  copyToAllWeekdays({ start: "08:00", end: "18:00" })
                }
                size="xs"
                variant="outline"
              >
                Pracovné dni - od 08:00 do 18:00
              </Button>
              <Button
                onClick={() =>
                  copyToAllWeekdays({ start: "07:00", end: "17:00" })
                }
                size="xs"
                variant="outline"
              >
                Pracovné dni - od 07:00 do 17:00
              </Button>
              <Button
                onClick={() => copyToWeekend("closed")}
                size="xs"
                variant="outline"
              >
                Víkendy - zatvorené
              </Button>
              <Button
                onClick={() => copyToWeekend({ start: "08:00", end: "12:00" })}
                size="xs"
                variant="outline"
              >
                Víkendy - od 08:00 do 12:00
              </Button>
              <Button
                onClick={() => {
                  copyToWeekend("closed");
                  copyToAllWeekdays("closed");
                }}
                size="xs"
                variant="outline"
              >
                Zatvorené
              </Button>
            </div>
          </div>
          <FieldGroup className="gap-2">
            {WEEKDAYS.map((weekday) => (
              <DayScheduleRow
                day={weekday}
                isCopying={selectedDay !== null}
                isSelected={selectedDay === weekday.key}
                key={weekday.key}
                onCopy={() =>
                  setSelectedDay(
                    selectedDay === weekday.key ? null : weekday.key
                  )
                }
                onPaste={() => handlePaste(weekday.key)}
                onUpdate={(schedule) => updateDay(weekday.key, schedule)}
                schedule={value.regularHours[weekday.key] ?? "closed"}
              />
            ))}
          </FieldGroup>
          <ExceptionsEditor
            exceptions={value.exceptions || {}}
            onChange={(exceptions) => onChange({ ...value, exceptions })}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type DayScheduleRowProps = {
  day: (typeof WEEKDAYS)[number];
  schedule: DaySchedule;
  onUpdate: (schedule: DaySchedule) => void;
  onCopy: () => void;
  onPaste: () => void;
  isCopying: boolean;
  isSelected: boolean;
};

function DayScheduleRow({
  day,
  schedule,
  onUpdate,
  onCopy,
  onPaste,
  isCopying,
  isSelected,
}: DayScheduleRowProps) {
  const isOpen = schedule !== "closed" && schedule !== null;
  const hours = isOpen ? schedule : { start: "08:00", end: "18:00" };
  return (
    <Field
      className={cn("rounded-md border px-2 py-1", isSelected && "bg-accent")}
      orientation="horizontal"
    >
      {/* <Switch
        checked={isOpen}
        onCheckedChange={(checked) => onUpdate(checked ? hours : "closed")}
      /> */}
      <Hint text={day.label}>
        <FieldLabel htmlFor={day.key}>{day.short}</FieldLabel>
      </Hint>
      <div className="flex flex-1 items-center gap-2">
        {isOpen ? (
          <>
            <TimeSelector
              disabled={!isOpen}
              onChange={(value) => onUpdate({ ...hours, start: value })}
              value={hours.start}
            />
            <span> - </span>
            <TimeSelector
              disabled={!isOpen}
              onChange={(value) => onUpdate({ ...hours, end: value })}
              value={hours.end}
            />
          </>
        ) : (
          <Badge size="xs" variant="outline">
            Zatvorené
          </Badge>
        )}
      </div>
      {isOpen && (
        <Button
          onClick={onCopy}
          size="icon-xs"
          title={isSelected ? "Zrušiť kopírovanie" : "Kopírovať"}
          type="button"
          variant={isSelected ? "secondary" : "ghost"}
        >
          {isSelected ? <CheckIcon /> : <CopyIcon />}
        </Button>
      )}
      {isCopying && !isSelected && (
        <Button
          onClick={onPaste}
          size="icon-xs"
          title="Vložiť otváracie hodiny"
          variant="ghost"
        >
          <ClipboardPasteIcon />
        </Button>
      )}
      <ToggleButton
        isOpen={isOpen}
        onUpdate={(open) => onUpdate(open ? hours : "closed")}
      />
    </Field>
  );
}

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4)
    .toString()
    .padStart(2, "0");
  const minute = ((index % 4) * 15).toString().padStart(2, "0");
  return `${hour}:${minute}`;
});

function TimeSelector({
  disabled,
  value,
  onChange,
}: {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(v) => onChange(v)}
      value={value ?? undefined}
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
  );
}

type ExceptionsEditorProps = {
  exceptions: { [date: string]: DaySchedule };
  onChange: (exceptions: { [date: string]: DaySchedule }) => void;
};

function ExceptionsEditor({ exceptions, onChange }: ExceptionsEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAdding, setIsAdding] = useState(false);

  const addException = (date: string, schedule: DaySchedule) => {
    onChange({ ...exceptions, [date]: schedule });
    setIsAdding(false);
    setSelectedDate(undefined);
  };

  const removeException = (date: string) => {
    const { [date]: _, ...rest } = exceptions;
    onChange(rest);
  };

  const exceptionList = Object.entries(exceptions).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium text-sm">Výnimky</h3>
      {exceptionList.length > 0 && (
        <FieldGroup className="flex flex-col gap-2">
          {exceptionList.map(([date, schedule]) => (
            <Field
              className="rounded-md border px-2 py-1"
              key={date}
              orientation="horizontal"
            >
              <Hint text={format(date, "EEEE - dd.MM.yyyy", { locale: sk })}>
                <FieldLabel htmlFor={date}>
                  {format(date, "EEE - dd.MM.yyyy", { locale: sk })}
                </FieldLabel>
              </Hint>

              {schedule === "closed" ? (
                <Badge size="xs" variant="outline">
                  Zatvorené
                </Badge>
              ) : (
                schedule && (
                  <span>
                    {schedule.start} - {schedule.end}
                  </span>
                )
              )}
              <Button
                className="ml-auto"
                onClick={() => removeException(date)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </Field>
          ))}
        </FieldGroup>
      )}
      {/* {isAdding && (
        <div>
          <Calendar
            mode="single"
            onSelect={(date) => setSelectedDate(date)}
            selected={selectedDate}
          />
          
        </div>
      )} */}
      <Popover onOpenChange={setIsAdding} open={isAdding}>
        <PopoverTrigger asChild>
          <Button
            className="w-full"
            onClick={() => setIsAdding(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon /> Pridať výnimku
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
          side="top"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            onSelect={(date) => setSelectedDate(date)}
            selected={selectedDate}
            weekStartsOn={1}
          />
          <div className="flex items-center justify-end gap-2 px-3 pb-3">
            <Button
              onClick={() => {
                addException(selectedDate?.toISOString() ?? "", "closed");
              }}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <CheckIcon />
            </Button>
            <Button
              onClick={() => setIsAdding(false)}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <XIcon />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ToggleButton({
  isOpen,
  onUpdate,
}: {
  isOpen: boolean;
  onUpdate: (isOpen: boolean) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => onUpdate(!isOpen)}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {isOpen ? (
            <>
              <XIcon />
              <span className="sr-only">Zatvorené</span>
            </>
          ) : (
            <>
              <CheckIcon />
              <span className="sr-only">Otvorené</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="center" side="right" sideOffset={4}>
        {isOpen ? "Zatvoriť" : "Otvoriť"}
      </TooltipContent>
    </Tooltip>
  );
}
