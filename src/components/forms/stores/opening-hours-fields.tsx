"use client";

import type z from "zod";
import { withFieldGroup } from "@/components/shared/form";
import { FieldGroup } from "@/components/ui/field";
import type { openingHoursSchema } from "@/lib/stores/validation";

type OpeningHoursFieldGroupValues = z.infer<typeof openingHoursSchema>;

const defaultValues: OpeningHoursFieldGroupValues | undefined = {
  regularHours: {
    monday: {
      start: "08:00",
      end: "18:00",
    },
    tuesday: {
      start: "08:00",
      end: "18:00",
    },
    wednesday: {
      start: "08:00",
      end: "18:00",
    },
    thursday: {
      start: "08:00",
      end: "18:00",
    },
    friday: {
      start: "08:00",
      end: "18:00",
    },
    saturday: {
      start: "08:00",
      end: "18:00",
    },
    sunday: {
      start: "08:00",
      end: "18:00",
    },
  },
  exceptions: {},
};

const options = [
  { value: "monday", label: "Pondelok" },
  { value: "tuesday", label: "Utorok" },
  { value: "wednesday", label: "Streda" },
  { value: "thursday", label: "Štvrtok" },
  { value: "friday", label: "Piatok" },
  { value: "saturday", label: "Sobota" },
  { value: "sunday", label: "Nedeľa" },
] as const;

export const OpeningHoursFieldGroup = withFieldGroup({
  defaultValues,
  render: ({ group }) => (
    <FieldGroup>
      {options.map((option) => (
        <group.AppField
          key={option.value}
          name={`regularHours.${option.value}`}
        >
          {(field) => <field.TimeField label={option.label} />}
        </group.AppField>
      ))}
      <group.AppField name="exceptions">
        {(field) => (
          <field.StoreExceptionsField label="Výnimky (sviatky, dovolenky)" />
        )}
      </group.AppField>
    </FieldGroup>
  ),
});
