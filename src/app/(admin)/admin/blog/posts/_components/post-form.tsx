"use client";

import type { JSONContent } from "@tiptap/react";
import { type ReactNode, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import z from "zod";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { RichTextField } from "@/components/forms/fields/rich-text-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { updatePostAction } from "@/features/posts/api/actions";
import type { AdminPost, AdminTag } from "@/features/posts/api/queries";
import { MAX_STRING_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SeoFields } from "./seo-fields";
import { TagSelector } from "./tag-selector";

export const postFormSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  excerpt: z.string().max(500).nullable(),
  content: z.custom<JSONContent>().nullable(),
  coverImageId: z.string().nullable(),
  metaTitle: z.string().max(MAX_STRING_LENGTH).nullable(),
  metaDescription: z.string().max(500).nullable(),
  tagIds: z.array(z.string()),
});

export type PostFormSchema = z.infer<typeof postFormSchema>;

type Props = {
  post: AdminPost;
  tags: AdminTag[];
  formId: string;
  renderFooter: (props: { isPending: boolean }) => ReactNode;
  className?: string;
};

export function PostForm({
  post,
  tags,
  formId,
  renderFooter,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<PostFormSchema>({
    defaultValues: {
      id: post.id,
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? null,
      content: post.content ?? null,
      coverImageId: post.coverImage?.id ?? null,
      metaTitle: post.metaTitle ?? null,
      metaDescription: post.metaDescription ?? null,
      tagIds: post.tagIds ?? [],
    },
  });

  const onSubmit = async (data: PostFormSchema) => {
    const result = await updatePostAction({
      id: data.id,
      post: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageId: data.coverImageId,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tagIds: data.tagIds,
      },
    });

    if (result.success) {
      toast.success("Článok bol uložený");
    } else if (result.error === "SLUG_TAKEN") {
      toast.error("Tento slug je už použitý iným článkom");
      form.setError("slug", { message: "Slug je už použitý" });
    } else {
      toast.error("Nepodarilo sa uložiť článok");
    }
  };

  return (
    <FormProvider {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <div
          className={cn(
            "grid max-w-full gap-6 @lg/page:p-5 @xl/page:max-w-5xl @xl/page:p-8 p-4",
            className
          )}
        >
          {/* Basic Info */}
          <FieldSet className="gap-5 @xl/page:gap-8">
            <FieldGroup className="grid grid-cols-2 gap-4 @xl/page:grid-cols-4 @xl/page:gap-6">
              <ImageUploadField
                className="col-span-full row-span-2 @xl/page:col-span-3"
                folder="posts"
                imageUrl={post.coverImageUrl ?? undefined}
                name="coverImageId"
              />
              <TextField label="Názov článku" name="title" placeholder="Názov" />
              <SlugField label="Slug" name="slug" />
            </FieldGroup>
          </FieldSet>

          {/* Excerpt */}
          <FieldSet className="gap-4">
            <div className="space-y-1">
              <FieldLabel>Excerpt</FieldLabel>
              <FieldDescription>
                Krátky popis článku zobrazený v zozname a na sociálnych sieťach.
              </FieldDescription>
            </div>
            <TextareaField
              name="excerpt"
              placeholder="Krátky popis článku..."
              rows={3}
            />
          </FieldSet>

          {/* Content */}
          <FieldSet className="gap-4">
            <div className="space-y-1">
              <FieldLabel>Obsah</FieldLabel>
              <FieldDescription>
                Hlavný obsah článku. Použite formátovanie pre nadpisy, zoznamy a
                odkazy.
              </FieldDescription>
            </div>
            <RichTextField
              className="min-h-[400px]"
              name="content"
              placeholder="Začnite písať obsah článku..."
              variant="full"
            />
          </FieldSet>

          {/* Tags */}
          <FieldSet className="gap-4">
            <TagSelector
              description="Vyberte štítky pre lepšiu organizáciu a vyhľadávanie."
              label="Štítky"
              name="tagIds"
              tags={tags}
            />
          </FieldSet>

          {/* SEO */}
          <SeoFields />
        </div>
      </form>
      {renderFooter({ isPending: form.formState.isSubmitting })}
    </FormProvider>
  );
}
