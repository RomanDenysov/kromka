import { withFieldGroup } from "@/components/shared/form";
import { getSlug } from "@/lib/get-slug";

type TitleFormProps = {
  name: string;
  slug: string;
};

const defaultValues: TitleFormProps = {
  name: "",
  slug: "",
};

export const TitleForm = withFieldGroup({
  defaultValues,
  render: ({ group }) => (
    <>
      <group.AppField
        listeners={{
          onChange: (event) => {
            group.setFieldValue("slug", getSlug(event.value));
          },
        }}
        name="name"
      >
        {(field) => <field.TextField label="Názov" />}
      </group.AppField>
      <group.AppField
        listeners={{
          onChange: (event) => {
            group.setFieldValue("slug", getSlug(event.value));
          },
        }}
        name="slug"
      >
        {(field) => <field.TextField label="Slug" />}
      </group.AppField>
    </>
  ),
});
