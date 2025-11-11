import z from "zod";
import { MUTATIONS } from "@/db/mutations/products";
import { QUERIES } from "@/db/queries/products";
import { createTRPCRouter, protectedProcedure } from "../init";

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
  images: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const result = await QUERIES.ADMIN.GET_PRODUCT_IMAGES(input.productId);
      return result?.images ?? [];
    }),
  // ACTIONS
  createDraft: protectedProcedure.mutation(
    async ({ ctx }) =>
      await MUTATIONS.ADMIN.CREATE_DRAFT_PRODUCT(ctx.session.user.id)
  ),
  // update: protectedProcedure.input(z.object({ id: z.string(), product: createProductSchema })).mutation(
  //   async ({ input }) => await MUTATIONS.ADMIN.UPDATE_PRODUCT(input.id, input.product)
  // ),
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
