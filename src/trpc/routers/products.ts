import z from "zod";
import { MUTATIONS } from "@/db/mutations/products";
import { QUERIES } from "@/db/queries/products";
import { productSchema } from "@/validation/products";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const adminProductsRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure.query(
    async () => await QUERIES.ADMIN.GET_PRODUCTS()
  ),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(
      async ({ input }) => await QUERIES.ADMIN.GET_PRODUCT_BY_ID(input.id)
    ),
  byCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_PRODUCTS_BY_CATEGORY(input.categoryId)
    ),
  // ACTIONS
  createDraft: protectedProcedure.mutation(
    async () => await MUTATIONS.ADMIN.CREATE_DRAFT_PRODUCT()
  ),
  copyProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.COPY_PRODUCT(input.productId)
    ),
  update: protectedProcedure
    .input(z.object({ id: z.string(), product: productSchema }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_PRODUCT(input.id, input.product)
    ),
  toggleIsActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(
      async ({ input }) => await MUTATIONS.ADMIN.TOGGLE_IS_ACTIVE(input.id)
    ),
  createImageRecord: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        blobUrl: z.string(),
        blobPath: z.string(),
        metadata: z.object({
          width: z.number(),
          height: z.number(),
          size: z.number(),
          filename: z.string(),
        }),
      })
    )
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPLOAD_PRODUCT_IMAGE(
          input.productId,
          input.blobUrl,
          input.blobPath,
          input.metadata
        )
    ),
  updateImageSortOrder: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        mediaIds: z.array(z.string()),
      })
    )
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_IMAGE_SORT_ORDER(
          input.productId,
          input.mediaIds
        )
    ),
  deleteImage: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        mediaId: z.string(),
      })
    )
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.DELETE_PRODUCT_IMAGE(
          input.productId,
          input.mediaId
        )
    ),
});

export const publicProductsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => await QUERIES.PUBLIC.GET_PRODUCTS()),
});
