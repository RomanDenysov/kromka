import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import {
  OrderStorePicker,
  type StoreOption,
} from "@/components/order-store-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import type { StoreSchedule, TimeRange } from "@/db/types";
import type { CheckoutFormData } from "@/features/checkout/schema";
import { PickupDateAlerts } from "./checkout-alerts";

type PickupDetailsCardProps = {
  form: UseFormReturn<CheckoutFormData>;
  storeOptions: StoreOption[];
  storeSchedule: StoreSchedule | null;
  timeRange: TimeRange | null;
  pickupDate: Date;
  restrictedPickupDates: Set<string> | null;
  hasNoAvailableDates: boolean;
};

/**
 * Card component for pickup location, date, and time selection.
 */
export function PickupDetailsCard({
  form,
  storeOptions,
  storeSchedule,
  timeRange,
  pickupDate,
  restrictedPickupDates,
  hasNoAvailableDates,
}: PickupDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Odberové miesto</CardTitle>
        <CardDescription>
          Vyberte si miesto a čas, kedy chcete odobrať vašu objednávku.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <OrderStorePicker
              onValueChange={(id) => field.onChange(id)}
              storeOptions={storeOptions}
              value={field.value}
            />
          )}
        />

        <PickupDateAlerts
          hasNoAvailableDates={hasNoAvailableDates}
          restrictedPickupDates={restrictedPickupDates}
        />

        <FieldGroup className="grid w-full gap-4 lg:grid-cols-5">
          <Controller
            control={form.control}
            name="pickupDate"
            render={({ field, fieldState }) => {
              const isInvalid = fieldState.isTouched && fieldState.invalid;
              return (
                <Field
                  className="w-full lg:col-span-3"
                  data-invalid={isInvalid}
                >
                  <OrderPickupDatePicker
                    onDateSelect={(date) => field.onChange(date)}
                    restrictedDates={restrictedPickupDates}
                    selectedDate={field.value}
                    storeSchedule={storeSchedule}
                  />
                  {isInvalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />
          <Controller
            control={form.control}
            name="pickupTime"
            render={({ field, fieldState }) => {
              const isInvalid = fieldState.isTouched && fieldState.invalid;
              return (
                <Field
                  className="w-full lg:col-span-2"
                  data-invalid={isInvalid}
                >
                  <OrderPickupTimePicker
                    disabled={!pickupDate}
                    onTimeSelect={(time) => field.onChange(time)}
                    selectedTime={field.value}
                    timeRange={timeRange}
                  />
                  {isInvalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
