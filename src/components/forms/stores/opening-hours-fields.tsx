"use client";

import type z from "zod";
import { withFieldGroup } from "@/components/shared/form";
import { FieldGroup } from "@/components/ui/field";
import type { openingHoursSchema } from "@/validation/stores";

type OpeningHoursFieldGroupValues = z.infer<typeof openingHoursSchema>;

const defaultValues: OpeningHoursFieldGroupValues | undefined = {
  days: {
    0: {
      start: "08:00",
      end: "18:00",
    },
    1: {
      start: "08:00",
      end: "18:00",
    },
    2: {
      start: "08:00",
      end: "18:00",
    },
    3: {
      start: "08:00",
      end: "18:00",
    },
    4: {
      start: "08:00",
      end: "18:00",
    },
    5: {
      start: "08:00",
      end: "18:00",
    },
    6: {
      start: "08:00",
      end: "18:00",
    },
  },
  exceptions: {
    "2025-12-24": {
      start: "08:00",
      end: "18:00",
    },
  },
};

const options = [
  { value: 0, label: "Nedeľa" },
  { value: 1, label: "Pondelok" },
  { value: 2, label: "Utorok" },
  { value: 3, label: "Streda" },
  { value: 4, label: "Štvrtok" },
  { value: 5, label: "Piatok" },
  { value: 6, label: "Sobota" },
] as const;

export const OpeningHoursFieldGroup = withFieldGroup({
  defaultValues,
  render: ({ group }) => (
    <FieldGroup>
      {options.map((option) => (
        <group.AppField key={option.value} name={`days.${option.value}`}>
          {(field) => <field.TimeField label={option.label} />}
        </group.AppField>
      ))}
      <group.AppField name="exceptions">
        {(field) => <field.DateRangeField label="Výnimky" />}
      </group.AppField>
    </FieldGroup>
  ),
});
