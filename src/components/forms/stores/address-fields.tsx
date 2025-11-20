"use client";

import { MapPinIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AddressFormFields() {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormContext();

  // Access nested address fields to show preview
  const street = form.useStore((state) => state.values.address?.street);
  const city = form.useStore((state) => state.values.address?.city);

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <MapPinIcon className="mr-2 size-4" />
          {street && city ? `${street}, ${city}` : "Nastaviť adresu"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">Adresa prevádzky</h3>
        </div>

        <FieldSet>
          <FieldGroup>
            <form.AppField name="address.street">
              {(field) => (
                <field.TextField label="Ulica a číslo" placeholder="Panská 1" />
              )}
            </form.AppField>

            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="address.city">
                {(field) => (
                  <field.TextField label="Mesto" placeholder="Bratislava" />
                )}
              </form.AppField>
              <form.AppField name="address.postalCode">
                {(field) => (
                  <field.TextField label="PSČ" placeholder="811 01" />
                )}
              </form.AppField>
            </div>

            <form.AppField name="address.country">
              {(field) => (
                <field.TextField label="Krajina" placeholder="Slovensko" />
              )}
            </form.AppField>

            <form.AppField name="address.googleId">
              {(field) => (
                <field.TextField
                  label="Google ID"
                  placeholder="Google Places ID (pre budúcu integráciu)"
                />
              )}
            </form.AppField>

            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="latitude">
                {(field) => (
                  <field.TextField
                    label="Zemepisná šírka"
                    placeholder="48.1486"
                  />
                )}
              </form.AppField>
              <form.AppField name="longitude">
                {(field) => (
                  <field.TextField
                    label="Zemepisná dĺžka"
                    placeholder="17.1077"
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </FieldSet>

        <Button
          className="mt-4 w-full"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          Hotovo
        </Button>
      </PopoverContent>
    </Popover>
  );
}
