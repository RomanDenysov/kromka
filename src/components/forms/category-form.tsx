"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  CalendarIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { SingleImageUpload } from "@/components/image-upload/single-image-upload";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { updateCategoryAction } from "@/lib/actions/categories";
import { getSlug } from "@/lib/get-slug";
import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/types/categories";
import { updateCategorySchema } from "@/validation/categories";
import { useAppForm } from "../shared/form";
import { Hint } from "../shared/hint";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// biome-ignore lint/style/noMagicNumbers: Image aspect ratio
const IMAGE_ASPECT_RATIO = 16 / 9;

export function CategoryForm({
  category,
}: {
  category?: AdminCategory | null;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: {
      id: category?.id ?? "",
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? null,
      pickupDates: category?.pickupDates ?? [],
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
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await updateCategoryAction({
          id: value.id,
          category: value,
        });
        if (result.success) {
          toast.success("Kategória bola uložená");
        } else if (result.error === "SLUG_TAKEN") {
          toast.error("Slug je už použitý inou kategóriou");
        } else {
          toast.error("Nepodarilo sa uložiť kategóriu");
        }
      });
    },
  });

  if (!category) {
    return <div>Kategória nebola nájdená</div>;
  }

  return (
    <form.AppForm>
      <form
        aria-disabled={isPending}
        id="category-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet className="@md/page:max-w-md max-w-full gap-5">
          <div className="flex flex-row items-start justify-between">
            <div>
              <FieldLegend>Nastavenie kategórie</FieldLegend>
              <FieldDescription className="text-[10px]">
                Naposledy uložené{" "}
                {format(category?.updatedAt ?? new Date(), "dd.MM.yyyy HH:mm")}
              </FieldDescription>
            </div>
            <div className="flex gap-1">
              <form.Subscribe
                selector={(state) => [state.isDirty, state.isValid]}
              >
                {([isDirty, isValid]) => (
                  <Button
                    disabled={isPending || !isDirty || !isValid}
                    size="xs"
                    type="submit"
                  >
                    <SaveIcon className="size-3.5" />
                    {isPending ? "Ukladá sa..." : "Uložiť"}
                  </Button>
                )}
              </form.Subscribe>
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
                    disabled={isPending}
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
              {(field) => (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <field.TextField label="Slug" placeholder="Slug" />
                  </div>
                  <form.Subscribe selector={(state) => state.values.name}>
                    {(name) => (
                      <Button
                        className="mt-6"
                        onClick={() => field.handleChange(getSlug(name))}
                        size="icon"
                        title="Generovať z názvu"
                        type="button"
                        variant="outline"
                      >
                        <RefreshCwIcon className="size-4" />
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              )}
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

          <form.Field name="pickupDates">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              // Фільтруємо невалідні дати та сортуємо
              const sortedDates = [...(field.state.value ?? [])]
                .filter(
                  (date) => date && !Number.isNaN(new Date(date).getTime())
                )
                .sort();

              const removeDate = (dateToRemove: string) => {
                field.handleChange(
                  field.state.value.filter((date) => date !== dateToRemove)
                );
              };

              const handleSelect = (dates: Date[] | undefined) => {
                if (!dates) {
                  field.handleChange([]);
                  return;
                }
                const formatted = dates
                  .map((date) => format(date, "yyyy-MM-dd"))
                  .sort();
                field.handleChange(formatted);
              };

              return (
                <Field
                  className={cn("rounded-md border bg-card p-3")}
                  data-invalid={isInvalid}
                >
                  <FieldLabel>Dátumy vyzdvihnutia</FieldLabel>
                  <FieldDescription>
                    Toto nastavenie obmedzuje dátumy vyzdvihnutia pre danú
                    kategóriu.
                    {sortedDates.length === 0 && (
                      <span className="block text-muted-foreground">
                        Ak nie sú vybrané žiadne dátumy, všetky dni sú dostupné.
                      </span>
                    )}
                  </FieldDescription>

                  {sortedDates.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {sortedDates.map((date) => (
                        <Hint
                          key={date}
                          text={format(new Date(date), "EEEE - dd.MM.yyyy", {
                            locale: sk,
                          })}
                        >
                          <div
                            className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1"
                            key={date}
                          >
                            <CalendarIcon className="size-3.5 text-muted-foreground" />
                            <span className="truncate font-medium text-xs">
                              {format(new Date(date), "d. MMM yyyy", {
                                locale: sk,
                              })}
                            </span>
                            <Button
                              className="size-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeDate(date)}
                              size="icon-xs"
                              type="button"
                              variant="ghost"
                            >
                              <XIcon className="size-3" />
                            </Button>
                          </div>
                        </Hint>
                      ))}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="mt-2 w-full"
                        size="xs"
                        type="button"
                        variant="outline"
                      >
                        <PlusIcon className="size-4" />
                        {sortedDates.length > 0
                          ? "Upraviť dátumy"
                          : "Pridať dátumy"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-fit">
                      <DialogHeader>
                        <DialogTitle>Vyberte dátumy vyzdvihnutia</DialogTitle>
                        <DialogDescription>
                          Vyberte dátumy, ktoré budú dostupné pre danú
                          kategóriu.
                        </DialogDescription>
                      </DialogHeader>
                      <Calendar
                        className="rounded-lg border shadow-sm"
                        defaultMonth={
                          sortedDates.length > 0
                            ? new Date(sortedDates[0])
                            : new Date()
                        }
                        disabled={{ before: new Date() }}
                        mode="multiple"
                        numberOfMonths={2}
                        onSelect={handleSelect}
                        selected={sortedDates.map((date) => new Date(date))}
                        weekStartsOn={1}
                      />
                    </DialogContent>
                  </Dialog>
                </Field>
              );
            }}
          </form.Field>
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
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
