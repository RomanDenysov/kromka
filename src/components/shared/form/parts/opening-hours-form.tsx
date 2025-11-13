import { withForm } from "@/components/shared/form";
import { FieldGroup } from "@/components/ui/field";

export const OpeningHoursForm = withForm({
  defaultValues: {
    openingHours: {
      weekdays: { open: "08:00", close: "18:00" },
      saturday: { open: "08:00", close: "18:00" },
      sunday: { open: "08:00", close: "18:00" },
    },
  },
  render: ({ form }) => (
    <FieldGroup className="gap-2">
      <form.AppField name="openingHours.weekdays">
        {(field) => <field.TimeField label="Cez týždeň" />}
      </form.AppField>
      <form.AppField name="openingHours.saturday">
        {(field) => <field.TimeField label="Sobota" />}
      </form.AppField>
      <form.AppField name="openingHours.sunday">
        {(field) => <field.TimeField label="Nedeľa" />}
      </form.AppField>
    </FieldGroup>
  ),
});
