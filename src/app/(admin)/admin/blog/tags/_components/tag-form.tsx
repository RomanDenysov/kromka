"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { FormProvider, type UseFormReturn, useForm } from "react-hook-form";
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
import { createTagAction, updateTagAction } from "@/features/posts/api/actions";
import type { AdminTag } from "@/features/posts/api/queries";
import { type TagSchema, tagSchema } from "@/features/posts/schema";

type Props = {
  tag: AdminTag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ActionResult = { success: boolean; error?: string };

type HandleResultOptions = {
  result: ActionResult;
  successMessage: string;
  errorMessage: string;
  form: UseFormReturn<TagSchema>;
  onSuccess: () => void;
};

function getButtonText(isPending: boolean, isEditing: boolean): string {
  if (isPending) return "Ukladanie...";
  return isEditing ? "Uložiť" : "Vytvoriť";
}

function handleTagResult(options: HandleResultOptions) {
  const { result, successMessage, errorMessage, form, onSuccess } = options;
  if (result.success) {
    toast.success(successMessage);
    onSuccess();
    return;
  }
  if (result.error === "SLUG_TAKEN") {
    toast.error("Tento slug je už použitý iným štítkom");
    form.setError("slug", { message: "Slug je už použitý" });
    return;
  }
  toast.error(errorMessage);
}

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

  const closeDialog = () => onOpenChange(false);

  const onSubmit = (data: TagSchema) => {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateTagAction({
          id: tag.id,
          name: data.name,
          slug: data.slug,
        });
        handleTagResult({
          result,
          successMessage: "Štítok bol aktualizovaný",
          errorMessage: "Nepodarilo sa aktualizovať štítok",
          form,
          onSuccess: closeDialog,
        });
      } else {
        const result = await createTagAction(data);
        handleTagResult({
          result,
          successMessage: "Štítok bol vytvorený",
          errorMessage: "Nepodarilo sa vytvoriť štítok",
          form,
          onSuccess: closeDialog,
        });
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
            {isPending && <Spinner />}
            {getButtonText(isPending, isEditing)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
