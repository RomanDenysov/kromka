"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JSONContent } from "@tiptap/react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { productStatusEnum } from "@/db/schema";
import type { Product } from "@/types/products";
import { BaseProductForm } from "./base-form";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  description: z.custom<JSONContent>().nullable(),
  stock: z.number().min(0),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
  status: z.enum(productStatusEnum.enumValues),
});

export type ProductFormValues = z.infer<typeof schema>;

export function ProductForm({ initialData }: { initialData: Product }) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
    },
    mode: "onChange",
  });

  // biome-ignore lint/suspicious/useAwait: async handler for form submission
  const onSubmit = async (values: ProductFormValues) => {
    // biome-ignore lint/suspicious/noConsole: temporary logging
    console.log(values);
  };

  return (
    <FormProvider {...form}>
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
        <BaseProductForm />
      </form>
    </FormProvider>
  );
}
