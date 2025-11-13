import { withForm } from "@/components/shared/form";

export const SortStateForm = withForm({
  defaultValues: {
    sortOrder: 0,
    isActive: false,
  },
  props: {},
  render: ({ form }) => (
    <>
      <form.AppField name="isActive">
        {(field) => <field.SwitchField label="Aktívny" />}
      </form.AppField>
      <form.AppField name="sortOrder">
        {(field) => (
          <field.QuantitySetterField label="Poradie" max={100} min={0} />
        )}
      </form.AppField>
    </>
  ),
});
