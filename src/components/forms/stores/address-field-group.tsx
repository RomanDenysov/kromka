import { FieldGroup } from "@/components/ui/field";
import { withFieldGroup } from "@/shared/components/form";

type AddressFieldGroupValues = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  googleId: string;
};

const defaultValues: AddressFieldGroupValues = {
  street: "",
  city: "",
  postalCode: "",
  country: "",
  googleId: "",
};

export const AddressFieldGroup = withFieldGroup({
  defaultValues,
  render: ({ group }) => (
    <FieldGroup>
      <group.AppField name="street">
        {(field) => (
          <field.TextField label="Ulica a číslo" placeholder="Panská 1" />
        )}
      </group.AppField>

      <div className="grid grid-cols-2 gap-4">
        <group.AppField name="city">
          {(field) => (
            <field.TextField label="Mesto" placeholder="Bratislava" />
          )}
        </group.AppField>
        <group.AppField name="postalCode">
          {(field) => <field.TextField label="PSČ" placeholder="811 01" />}
        </group.AppField>
      </div>

      <group.AppField name="country">
        {(field) => <field.TextField label="Krajina" placeholder="Slovensko" />}
      </group.AppField>

      <group.AppField name="googleId">
        {(field) => (
          <field.TextField
            label="Google ID"
            placeholder="Google Places ID (pre budúcu integráciu)"
          />
        )}
      </group.AppField>
    </FieldGroup>
  ),
});
