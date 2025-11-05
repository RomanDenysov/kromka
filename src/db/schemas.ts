/**
 * Centralized database schemas using drizzle-zod
 * Single source of truth - all schemas are inferred from database tables
 */

import { z } from "zod";
import {
  insertCategoryAvailabilityWindowSchema,
  insertCategorySchema,
  insertProductCategorySchema,
  updateCategoryAvailabilityWindowSchema,
  updateCategorySchema,
  updateProductCategorySchema,
} from "./schema/categories";
import {
  createChannelEnumSchema,
  createInvoiceStatusEnumSchema,
  createOrderStatusEnumSchema,
  createPaymentMethodEnumSchema,
  createPaymentStatusEnumSchema,
  createProductStatusEnumSchema,
} from "./schema/enums";
import {
  insertInvoiceItemSchema,
  insertInvoiceSchema,
  updateInvoiceItemSchema,
  updateInvoiceSchema,
} from "./schema/invoices";
import { insertMediaSchema, updateMediaSchema } from "./schema/media";
import {
  insertOrderItemSchema,
  insertOrderSchema,
  updateOrderItemSchema,
  updateOrderSchema,
} from "./schema/orders";
import { insertPriceSchema, updatePriceSchema } from "./schema/prices";
import {
  insertProductChannelSchema,
  updateProductChannelSchema,
} from "./schema/product-channels";
import {
  insertProductImageSchema,
  insertProductSchema,
  updateProductImageSchema,
  updateProductSchema,
} from "./schema/products";
import {
  insertStoreMemberSchema,
  insertStoreSchema,
  updateStoreMemberSchema,
  updateStoreSchema,
} from "./schema/stores";

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const channelEnumSchema = createChannelEnumSchema;
export const orderStatusEnumSchema = createOrderStatusEnumSchema;
export const paymentStatusEnumSchema = createPaymentStatusEnumSchema;
export const paymentMethodEnumSchema = createPaymentMethodEnumSchema;
export const invoiceStatusEnumSchema = createInvoiceStatusEnumSchema;
export const productStatusEnumSchema = createProductStatusEnumSchema;

// ============================================================================
// MEDIA SCHEMAS
// ============================================================================

export const createMediaSchema = insertMediaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const mediaSchema = insertMediaSchema;

export const updateMediaSchemaPartial = updateMediaSchema;

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const createCategorySchema = insertCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const categorySchema = insertCategorySchema;

export const updateCategorySchemaPartial = updateCategorySchema;

// Category Availability Window
export const createCategoryAvailabilityWindowSchema =
  insertCategoryAvailabilityWindowSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const categoryAvailabilityWindowSchema =
  insertCategoryAvailabilityWindowSchema;

export const updateCategoryAvailabilityWindowSchemaPartial =
  updateCategoryAvailabilityWindowSchema;

// Product Category (junction table)
export const createProductCategorySchema = insertProductCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const productCategorySchema = insertProductCategorySchema;

export const updateProductCategorySchemaPartial = updateProductCategorySchema;

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

// Base product schema (without relations)
export const createProductSchema = insertProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  deletedAt: true,
});

export const productSchema = insertProductSchema;

export const updateProductSchemaPartial = updateProductSchema;

// Product with relations (for forms and complex operations)
export const createProductWithRelationsSchema = createProductSchema.extend({
  // Categories as array of category IDs
  categories: z.array(z.string()).default([]),
  // Channels configuration
  channels: z
    .array(
      z.object({
        channel: channelEnumSchema,
        isListed: z.boolean().default(true),
      })
    )
    .default([]),
  // Prices configuration
  prices: z
    .array(
      insertPriceSchema
        .omit({
          id: true,
          productId: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          id: z.string().optional(), // For updates
        })
    )
    .default([]),
});

export const productWithRelationsSchema = insertProductSchema.extend({
  categories: z.array(z.string()).default([]),
  channels: z
    .array(
      z.object({
        channel: channelEnumSchema,
        isListed: z.boolean().default(true),
      })
    )
    .default([]),
  prices: z
    .array(
      insertPriceSchema
        .omit({
          productId: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          id: z.string().optional(),
        })
    )
    .default([]),
});

export const updateProductWithRelationsSchema = updateProductSchema
  .partial()
  .extend({
    categories: z.array(z.string()).optional(),
    channels: z
      .array(
        z.object({
          channel: channelEnumSchema,
          isListed: z.boolean().default(true),
        })
      )
      .optional(),
    prices: z
      .array(
        insertPriceSchema
          .omit({
            productId: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            id: z.string().optional(),
          })
      )
      .optional(),
  });

// Product Image
export const createProductImageSchema = insertProductImageSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const productImageSchema = insertProductImageSchema;

export const updateProductImageSchemaPartial = updateProductImageSchema;

// Product Channel
export const createProductChannelSchema = insertProductChannelSchema;

export const productChannelSchema = insertProductChannelSchema;

export const updateProductChannelSchemaPartial = updateProductChannelSchema;

// ============================================================================
// PRICE SCHEMAS
// ============================================================================

export const createPriceSchema = insertPriceSchema.omit({
  id: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
});

export const priceSchema = insertPriceSchema;

export const updatePriceSchemaPartial = updatePriceSchema;

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

// Base order schema (without items)
export const createOrderSchema = insertOrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orderNumber: true, // Usually auto-generated
});

export const orderSchema = insertOrderSchema;

export const updateOrderSchemaPartial = updateOrderSchema;

// Order with items (for forms and complex operations)
export const createOrderWithItemsSchema = createOrderSchema.extend({
  items: z
    .array(
      insertOrderItemSchema.omit({
        orderId: true,
      })
    )
    .default([]),
});

export const orderWithItemsSchema = insertOrderSchema.extend({
  items: z
    .array(
      insertOrderItemSchema.omit({
        orderId: true,
      })
    )
    .default([]),
});

export const updateOrderWithItemsSchema = updateOrderSchema.partial().extend({
  items: z
    .array(
      insertOrderItemSchema.omit({
        orderId: true,
      })
    )
    .optional(),
});

// Order Item
export const createOrderItemSchema = insertOrderItemSchema.omit({
  orderId: true,
});

export const orderItemSchema = insertOrderItemSchema;

export const updateOrderItemSchemaPartial = updateOrderItemSchema;

// ============================================================================
// INVOICE SCHEMAS
// ============================================================================

// Base invoice schema (without items)
export const createInvoiceSchema = insertInvoiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  number: true, // Usually auto-generated
});

export const invoiceSchema = insertInvoiceSchema;

export const updateInvoiceSchemaPartial = updateInvoiceSchema;

// Invoice with items (for forms and complex operations)
export const createInvoiceWithItemsSchema = createInvoiceSchema.extend({
  items: z
    .array(
      insertInvoiceItemSchema.omit({
        invoiceId: true,
        createdAt: true,
        updatedAt: true,
      })
    )
    .default([]),
});

export const invoiceWithItemsSchema = insertInvoiceSchema.extend({
  items: z
    .array(
      insertInvoiceItemSchema.omit({
        invoiceId: true,
        createdAt: true,
        updatedAt: true,
      })
    )
    .default([]),
});

export const updateInvoiceWithItemsSchema = updateInvoiceSchema
  .partial()
  .extend({
    items: z
      .array(
        insertInvoiceItemSchema.omit({
          invoiceId: true,
          createdAt: true,
          updatedAt: true,
        })
      )
      .optional(),
  });

// Invoice Item
export const createInvoiceItemSchema = insertInvoiceItemSchema.omit({
  invoiceId: true,
  createdAt: true,
  updatedAt: true,
});

export const invoiceItemSchema = insertInvoiceItemSchema;

export const updateInvoiceItemSchemaPartial = updateInvoiceItemSchema;

// ============================================================================
// STORE SCHEMAS
// ============================================================================

export const createStoreSchema = insertStoreSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const storeSchema = insertStoreSchema;

export const updateStoreSchemaPartial = updateStoreSchema;

// Store Member
export const createStoreMemberSchema = insertStoreMemberSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const storeMemberSchema = insertStoreMemberSchema;

export const updateStoreMemberSchemaPartial = updateStoreMemberSchema;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ChannelEnum = z.infer<typeof channelEnumSchema>;
export type OrderStatusEnum = z.infer<typeof orderStatusEnumSchema>;
export type PaymentStatusEnum = z.infer<typeof paymentStatusEnumSchema>;
export type PaymentMethodEnum = z.infer<typeof paymentMethodEnumSchema>;
export type InvoiceStatusEnum = z.infer<typeof invoiceStatusEnumSchema>;
export type ProductStatusEnum = z.infer<typeof productStatusEnumSchema>;

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type Category = z.infer<typeof categorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchemaPartial>;

export type CreateCategoryAvailabilityWindow = z.infer<
  typeof createCategoryAvailabilityWindowSchema
>;
export type CategoryAvailabilityWindow = z.infer<
  typeof categoryAvailabilityWindowSchema
>;
export type UpdateCategoryAvailabilityWindow = z.infer<
  typeof updateCategoryAvailabilityWindowSchemaPartial
>;

export type CreateProductCategory = z.infer<typeof createProductCategorySchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type UpdateProductCategory = z.infer<
  typeof updateProductCategorySchemaPartial
>;

export type CreateProduct = z.infer<typeof createProductSchema>;
export type Product = z.infer<typeof productSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchemaPartial>;

export type CreateProductWithRelations = z.infer<
  typeof createProductWithRelationsSchema
>;
export type ProductWithRelations = z.infer<typeof productWithRelationsSchema>;
export type UpdateProductWithRelations = z.infer<
  typeof updateProductWithRelationsSchema
>;

export type CreateProductImage = z.infer<typeof createProductImageSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type UpdateProductImage = z.infer<
  typeof updateProductImageSchemaPartial
>;

export type CreateProductChannel = z.infer<typeof createProductChannelSchema>;
export type ProductChannel = z.infer<typeof productChannelSchema>;
export type UpdateProductChannel = z.infer<
  typeof updateProductChannelSchemaPartial
>;

export type CreatePrice = z.infer<typeof createPriceSchema>;
export type Price = z.infer<typeof priceSchema>;
export type UpdatePrice = z.infer<typeof updatePriceSchemaPartial>;

export type CreateOrder = z.infer<typeof createOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchemaPartial>;

export type CreateOrderWithItems = z.infer<typeof createOrderWithItemsSchema>;
export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;
export type UpdateOrderWithItems = z.infer<typeof updateOrderWithItemsSchema>;

export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type UpdateOrderItem = z.infer<typeof updateOrderItemSchemaPartial>;

export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchemaPartial>;

export type CreateInvoiceWithItems = z.infer<
  typeof createInvoiceWithItemsSchema
>;
export type InvoiceWithItems = z.infer<typeof invoiceWithItemsSchema>;
export type UpdateInvoiceWithItems = z.infer<
  typeof updateInvoiceWithItemsSchema
>;

export type CreateInvoiceItem = z.infer<typeof createInvoiceItemSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type UpdateInvoiceItem = z.infer<typeof updateInvoiceItemSchemaPartial>;

export type CreateStore = z.infer<typeof createStoreSchema>;
export type Store = z.infer<typeof storeSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchemaPartial>;

export type CreateStoreMember = z.infer<typeof createStoreMemberSchema>;
export type StoreMember = z.infer<typeof storeMemberSchema>;
export type UpdateStoreMember = z.infer<typeof updateStoreMemberSchemaPartial>;

export type CreateMedia = z.infer<typeof createMediaSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type UpdateMedia = z.infer<typeof updateMediaSchemaPartial>;
