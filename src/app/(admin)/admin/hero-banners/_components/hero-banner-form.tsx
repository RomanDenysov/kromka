"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { SelectField } from "@/components/forms/fields/select-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import {
  createHeroBannerAction,
  updateHeroBannerAction,
} from "@/features/hero-banners/api/actions";
import type { HeroBannerRow } from "@/features/hero-banners/api/queries";
import {
  type HeroBannerSchema,
  heroBannerSchema,
} from "@/features/hero-banners/schema";

interface CategoryOption {
  name: string;
  slug: string;
}

interface Props {
  banner?: HeroBannerRow | null;
  categories: CategoryOption[];
  className?: string;
}

function buildCtaOptions(categories: CategoryOption[]) {
  const options = [{ value: "/e-shop", label: "E-shop (hlavna)" }];
  for (const cat of categories) {
    options.push({
      value: `/e-shop?category=${cat.slug}`,
      label: cat.name,
    });
  }
  return options;
}

export function HeroBannerForm({ banner, categories, className }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!banner;

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<HeroBannerSchema>({
    resolver: zodResolver(heroBannerSchema),
    defaultValues: {
      name: banner?.name ?? "",
      heading: banner?.heading ?? "",
      subtitle: banner?.subtitle ?? "",
      imageId: banner?.imageId ?? null,
      ctaLabel: banner?.ctaLabel ?? "Objednat online",
      ctaHref: banner?.ctaHref ?? "/e-shop",
    },
  });

  const ctaOptions = buildCtaOptions(categories);

  const onSubmit = async (data: HeroBannerSchema) => {
    if (banner) {
      const result = await updateHeroBannerAction({ id: banner.id, data });
      if (result.success) {
        toast.success("Banner bol ulozeny");
      } else {
        toast.error("Nepodarilo sa ulozit banner");
      }
    } else {
      const result = await createHeroBannerAction(data);
      if (result.success) {
        toast.success("Banner bol vytvoreny");
        router.push(`/admin/hero-banners/${result.id}` as never);
      } else {
        toast.error("Nepodarilo sa vytvorit banner");
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <FieldSet className={className}>
          <FieldGroup className="grid @xl/page:max-w-3xl @xl/page:grid-cols-2 grid-cols-1 @xl/page:gap-6 gap-4">
            <ImageUploadField
              className="col-span-full"
              folder="hero"
              imageUrl={banner?.image?.url}
              name="imageId"
            />
            <TextField
              label="Nazov (interny)"
              name="name"
              placeholder="napr. Velka noc 2026"
            />
            <TextField
              label="Nadpis"
              name="heading"
              placeholder="S laskou ku kvasku"
            />
            <TextField
              className="col-span-full"
              label="Podnadpis"
              name="subtitle"
              placeholder="Remeselna pekaren"
            />
            <TextField
              label="Text tlacidla"
              name="ctaLabel"
              placeholder="Objednat online"
            />
            <SelectField
              label="Odkaz tlacidla"
              name="ctaHref"
              options={ctaOptions}
              placeholder="Vyberte ciel"
            />
          </FieldGroup>
        </FieldSet>
        <div className="flex items-center justify-end gap-2 p-4 @xl/page:px-8">
          <Button
            disabled={form.formState.isSubmitting}
            size="sm"
            type="submit"
          >
            {isEdit ? "Ulozit" : "Vytvorit"}
            {form.formState.isSubmitting ? <Spinner /> : <Kbd>↵</Kbd>}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
