import type {
  ChannelConfigFormSchema,
  PriceFormSchema,
  ProductFormSchema,
} from "../schema";

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: unknown;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  status: "draft" | "active" | "inactive" | "archived";
  categories?: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
  }>;
  channels?: Array<{
    channel: "B2C" | "B2B";
    isListed: boolean;
  }>;
  prices?: Array<{
    id: string;
    channel: "B2C" | "B2B";
    orgId: string | null;
    currency: string;
    amountCents: number;
    minQty: number;
    priority: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  }>;
};

/**
 * Transform database product to form format
 */
export function dbProductToForm(product: DbProduct): ProductFormSchema {
  // Convert description from JSON to string
  let description: string | null = null;
  if (product.description) {
    if (typeof product.description === "string") {
      description = product.description;
    } else {
      description = JSON.stringify(product.description);
    }
  }

  // Transform categories
  const categories = product.categories?.map((pc) => pc.categoryId) ?? [];

  // Transform channels
  const channels: ChannelConfigFormSchema[] =
    product.channels?.map((ch) => ({
      channel: ch.channel,
      isListed: ch.isListed,
    })) ?? [];

  // Transform prices
  const prices: PriceFormSchema[] =
    product.prices?.map((price) => ({
      id: price.id,
      channel: price.channel,
      orgId: price.orgId ?? undefined,
      currency: price.currency,
      amountCents: price.amountCents,
      minQty: price.minQty,
      priority: price.priority,
      startsAt: price.startsAt ?? undefined,
      endsAt: price.endsAt ?? undefined,
      isActive: price.isActive,
    })) ?? [];

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description,
    stock: product.stock,
    categories,
    channels,
    prices,
    status: product.status,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
  };
}

/**
 * Transform form data to database format for updates
 */
export function formToDbUpdate(formData: ProductFormSchema, productId: string) {
  // Convert description from string to JSON if needed
  let description: unknown = null;
  if (formData.description) {
    try {
      description = JSON.parse(formData.description);
    } catch {
      // If not valid JSON, store as string
      description = formData.description;
    }
  }

  return {
    id: productId,
    name: formData.name,
    slug: formData.slug,
    sku: formData.sku,
    description,
    stock: formData.stock,
    status: formData.status,
    isActive: formData.isActive,
    sortOrder: formData.sortOrder,
    // These will be handled separately via relations
    categories: formData.categories,
    channels: formData.channels,
    prices: formData.prices,
  };
}
