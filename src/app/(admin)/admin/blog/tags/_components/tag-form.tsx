"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SlugField } from "@/components/forms/fields/slug-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  createTagAction,
  updateTagAction,
} from "@/features/posts/api/actions";
import type { AdminTag } from "@/features/posts/api/queries";
import { type TagSchema, tagSchema } from "@/features/posts/schema";

type Props = {
  tag: AdminTag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TagForm({ tag, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!tag;

  const form = useForm<TagSchema>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name ?? "",
      slug: tag?.slug ?? "",
    },
  });

  // Reset form when tag changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: tag?.name ?? "",
        slug: tag?.slug ?? "",
      });
    }
  }, [tag, open, form]);

  const onSubmit = (data: TagSchema) => {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateTagAction({
          id: tag.id,
          name: data.name,
          slug: data.slug,
        });

        if (result.success) {
          toast.success("Štítok bol aktualizovaný");
          onOpenChange(false);
        } else if (result.error === "SLUG_TAKEN") {
          toast.error("Tento slug je už použitý iným štítkom");
          form.setError("slug", { message: "Slug je už použitý" });
        } else {
          toast.error("Nepodarilo sa aktualizovať štítok");
        }
      } else {
        const result = await createTagAction(data);

        if (result.success) {
          toast.success("Štítok bol vytvorený");
          onOpenChange(false);
        } else if (result.error === "SLUG_TAKEN") {
          toast.error("Tento slug je už použitý iným štítkom");
          form.setError("slug", { message: "Slug je už použitý" });
        } else {
          toast.error("Nepodarilo sa vytvoriť štítok");
        }
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Upraviť štítok" : "Nový štítok"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Upravte názov a slug štítku."
              : "Vytvorte nový štítok pre články."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            className="space-y-4"
            id="tag-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <TextField<TagSchema>
              label="Názov"
              name="name"
              placeholder="Názov štítku"
            />
            <SlugField<TagSchema> label="Slug" name="slug" />
          </form>
        </FormProvider>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Zrušiť
          </Button>
          <Button disabled={isPending} form="tag-form" type="submit">
            {isPending ? (
              <>
                <Spinner />
                Ukladanie...
              </>
            ) : isEditing ? (
              "Uložiť"
            ) : (
              "Vytvoriť"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
