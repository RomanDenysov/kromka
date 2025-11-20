"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { SingleImageUpload } from "@/components/image-upload";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useTRPC } from "@/trpc/client";
import { updateCategorySchema } from "@/validation/categories";
import { useAppForm } from "../shared/form";
import { FormSkeleton } from "../shared/form/form-skeleton";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// biome-ignore lint/style/noMagicNumbers: Image aspect ratio
const IMAGE_ASPECT_RATIO = 16 / 9;

export function CategoryForm({ id }: { id: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: category, isLoading: isLoadingCategory } = useSuspenseQuery(
    trpc.admin.categories.byId.queryOptions({ id })
  );
  const { mutate: updateCategory, isPending: isPendingUpdateCategory } =
    useMutation(
      trpc.admin.categories.update.mutationOptions({
        onSuccess: async (updatedCategory) => {
          await queryClient.invalidateQueries({
            queryKey: trpc.admin.categories.byId.queryOptions({
              id: updatedCategory.id,
            }).queryKey,
          });
        },
        onError: (error) => {
          // biome-ignore lint/suspicious/noConsole: TODO: Implement error handling
          console.error(error);
        },
      })
    );

  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? null,
      isActive: category?.isActive ?? false,
      showInMenu: category?.showInMenu ?? true,
      showInB2c: category?.showInB2c ?? true,
      showInB2b: category?.showInB2b ?? true,
      imageId: category?.imageId ?? null,
      sortOrder: category?.sortOrder ?? 0,
    },
    validators: {
      onSubmit: updateCategorySchema,
    },
    onSubmit: ({ value }) => updateCategory({ id, category: value }),
  });

  if (isLoadingCategory) {
    return <FormSkeleton className="max-w-md" />;
  }

  return (
    <form.AppForm>
      <form
        aria-disabled={isPendingUpdateCategory}
        id="category-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet className="max-w-md gap-5">
          <div className="flex flex-row items-start justify-between">
            <div>
              <FieldLegend>Nastavenie kategórie</FieldLegend>
              <FieldDescription>
                {isPendingUpdateCategory || isLoadingCategory
                  ? "Ukladá sa..."
                  : `Naposledy uložené ${format(
                      category?.updatedAt ?? new Date(),
                      "dd.MM.yyyy HH:mm"
                    )}`}
              </FieldDescription>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-xs" variant="ghost">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive">
                    <Trash2Icon />
                    Vymazať
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <FieldGroup className="gap-4">
            <form.AppField name="imageId">
              {(field) => (
                <Field className="flex flex-col gap-2">
                  <SingleImageUpload
                    aspect={IMAGE_ASPECT_RATIO}
                    className="w-full"
                    disabled={isPendingUpdateCategory}
                    onChange={(val) => field.handleChange(val)}
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.AppField>
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Názov kategórie"
                  placeholder="Názov kategórie"
                />
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => <field.TextField label="Slug" placeholder="Slug" />}
            </form.AppField>
            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Popis"
                  placeholder="Popis kategórie..."
                />
              )}
            </form.AppField>
          </FieldGroup>
          <FieldGroup className="gap-4">
            <div className="h-8 w-full rounded bg-muted/20" />
          </FieldGroup>
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              <form.AppField name="isActive">
                {(field) => (
                  <field.SwitchField
                    description="Je kategória aktívna?"
                    label="Aktívna"
                  />
                )}
              </form.AppField>
              <form.AppField name="showInMenu">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť v menu?"
                    label="V menu"
                  />
                )}
              </form.AppField>
              <form.AppField name="showInB2c">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť pre B2C?"
                    label="B2C"
                  />
                )}
              </form.AppField>
              <form.AppField name="showInB2b">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť pre B2B?"
                    label="B2B"
                  />
                )}
              </form.AppField>
            </div>
            <form.AppField name="sortOrder">
              {(field) => <field.QuantitySetterField label="Poradie" min={0} />}
            </form.AppField>
          </FieldGroup>
          <form.SubmitButton
            className="self-end"
            form="category-form"
            size="sm"
          />
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
