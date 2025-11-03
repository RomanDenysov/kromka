"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import type { CreateProductSchema } from "../schema";

export async function createDraftProduct() {
  const draftProduct: CreateProductSchema = {
    name: "New Product",
    slug: `${getSlug("new-product")}-${createShortId()}`,
    sku: `SKU-${createShortId()}`,
    description: "New Product Description",
    stock: 0,
    prices: [],
    categories: [],
    status: "draft",
    isActive: false,
    sortOrder: 0,
  };

  const [newDraftProduct] = await db
    .insert(products)
    .values(draftProduct)
    .returning({ id: products.id });

  revalidatePath("/admin/b2c/products" as Route);

  redirect(`/admin/b2c/products/${newDraftProduct.id}` as Route);
}
