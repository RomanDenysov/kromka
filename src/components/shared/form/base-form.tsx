import { format } from "date-fns";
import { useCallback } from "react";
import z from "zod";
import { useAppForm } from "@/components/shared/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

const baseFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

type BaseFormValues = z.infer<typeof baseFormSchema>;

type Props = {
  name: string;
  slug: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
  onSubmit: (values: BaseFormValues) => void;
};

export function BaseForm({ name, slug, user, createdAt, onSubmit }: Props) {
  const handleSubmit = useCallback(
    ({ value }: { value: BaseFormValues }) => {
      onSubmit?.({ ...value });
    },
    [onSubmit]
  );

  const form = useAppForm({
    defaultValues: {
      name,
      slug,
    },
    validators: {
      onSubmit: baseFormSchema,
    },
    onSubmit: handleSubmit,
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-0">
        <form.AppField name="name">
          {(field) => (
            <field.EditableField
              className="font-medium text-xl md:text-2xl"
              placeholder="Name"
            />
          )}
        </form.AppField>
        <form.AppField name="slug">
          {(field) => <field.EditableField label="Slug" placeholder="Slug" />}
        </form.AppField>
      </div>

      <div className="flex flex-row items-center justify-start gap-2">
        {user && (
          <div className="flex items-center gap-1 rounded-md border px-1 py-0.5 text-xs">
            <Avatar className="size-6 rounded-md">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="rounded-md">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-xs">
              {user.name || user.email}
            </span>
          </div>
        )}
        <Badge size="xs" variant="outline">
          {format(createdAt, "dd.MM.yyyy")}
        </Badge>
      </div>
    </form>
  );
}
