import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { withFieldGroup } from "@/shared/components/form";

type TimeSlot = {
  open: string;
  close: string;
};

type DaySchedule = {
  period: TimeSlot | null;
  isClosed: boolean;
};

type OpeningHoursSection = "weekdays" | "saturday" | "sunday";

const DEFAULT_OPEN_TIME = "08:00";
const DEFAULT_CLOSE_TIME = "18:00";

const createDefaultDaySchedule = (): DaySchedule => ({
  period: { open: DEFAULT_OPEN_TIME, close: DEFAULT_CLOSE_TIME },
  isClosed: false,
});

const defaultValues: Record<OpeningHoursSection, DaySchedule> = {
  weekdays: createDefaultDaySchedule(),
  saturday: createDefaultDaySchedule(),
  sunday: createDefaultDaySchedule(),
};

type OpeningHoursFormProps = {
  className?: string;
  labels?: Partial<Record<OpeningHoursSection, string>>;
};

export const OpeningHoursForm = withFieldGroup({
  defaultValues,
  props: {} as OpeningHoursFormProps,
  render: ({ group, ...rest }) => {
    const { className, labels } = rest as OpeningHoursFormProps;
    const labelOverrides = (labels ?? {}) as Partial<
      Record<OpeningHoursSection, string>
    >;
    const labelMap: Record<OpeningHoursSection, string> = {
      weekdays: labelOverrides.weekdays ?? "Cez týždeň",
      saturday: labelOverrides.saturday ?? "Sobota",
      sunday: labelOverrides.sunday ?? "Nedeľa",
    };

    return (
      <FieldGroup className={cn("gap-2", className)}>
        <group.AppField name="weekdays">
          {(field) => <field.TimeField label={labelMap.weekdays} />}
        </group.AppField>
        <group.AppField name="saturday">
          {(field) => <field.TimeField label={labelMap.saturday} />}
        </group.AppField>
        <group.AppField name="sunday">
          {(field) => <field.TimeField label={labelMap.sunday} />}
        </group.AppField>
      </FieldGroup>
    );
  },
});
