import { withForm } from "@/components/shared/form";
import { getSlug } from "@/lib/get-slug";

export const BaseForm = withForm({
  defaultValues: {
    name: "",
    slug: "",
  },
  props: {},
  render: ({ form }) => (
    <>
      <form.AppField
        listeners={{
          onChange: (event) => {
            form.setFieldValue("slug", getSlug(event.value));
          },
        }}
        name="name"
      >
        {(field) => <field.TextField label="Názov" />}
      </form.AppField>
      <form.AppField name="slug">
        {(field) => <field.TextField label="Slug" />}
      </form.AppField>
    </>
  ),
});
