/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import z from "zod";
import { MUTATIONS } from "@/db/mutations/invoices";
import { QUERIES } from "@/db/queries/invoices";
import {
  invoiceItemSchema,
  invoiceSchema,
  invoiceWithRelationsSchema,
} from "@/validation/invoices";
import { createTRPCRouter, protectedProcedure } from "../init";

function transformInvoice(invoice: any) {
  if (!invoice) {
    return null;
  }
  return {
    ...invoice,
    createdByUser: invoice.createdBy ?? null,
  };
}

export const adminInvoicesRouter = createTRPCRouter({
  // QUERIES
  list: protectedProcedure
    .input(
      z
        .object({
          status: invoiceSchema.shape.status.optional(),
          companyId: z.string().optional(),
          createdBy: z.string().optional(),
        })
        .optional()
    )
    .output(z.array(invoiceWithRelationsSchema.nullable()))
    .query(async ({ input }) => {
      const invoices = await QUERIES.ADMIN.GET_INVOICES(input);
      return invoices.map(transformInvoice);
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(invoiceWithRelationsSchema.nullable())
    .query(async ({ input }) => {
      const invoice = await QUERIES.ADMIN.GET_INVOICE_BY_ID(input.id);
      return transformInvoice(invoice);
    }),

  byNumber: protectedProcedure
    .input(z.object({ number: z.string() }))
    .output(invoiceWithRelationsSchema.nullable())
    .query(async ({ input }) => {
      const invoice = await QUERIES.ADMIN.GET_INVOICE_BY_NUMBER(input.number);
      return transformInvoice(invoice);
    }),

  items: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .output(z.array(invoiceItemSchema))
    .query(
      async ({ input }) =>
        await QUERIES.ADMIN.GET_INVOICE_ITEMS(input.invoiceId)
    ),

  // MUTATIONS
  createDraft: protectedProcedure
    .input(
      invoiceSchema
        .pick({
          companyId: true,
          series: true,
          status: true,
          issueDate: true,
          dueDate: true,
          sentAt: true,
          paidAt: true,
          billingAddress: true,
          notes: true,
          subtotalCents: true,
          taxCents: true,
          totalCents: true,
        })
        .partial()
        .optional()
    )
    .output(invoiceSchema)
    .mutation(
      async ({ input, ctx }) =>
        await MUTATIONS.ADMIN.CREATE_DRAFT_INVOICE(
          ctx.session.user.id,
          input ?? {}
        )
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        invoice: invoiceSchema
          .pick({
            companyId: true,
            series: true,
            status: true,
            issueDate: true,
            dueDate: true,
            sentAt: true,
            paidAt: true,
            billingAddress: true,
            notes: true,
            subtotalCents: true,
            taxCents: true,
            totalCents: true,
          })
          .partial(),
      })
    )
    .output(invoiceSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_INVOICE(input.id, input.invoice)
    ),

  updateStatus: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        status: invoiceSchema.shape.status,
        additionalFields: invoiceSchema
          .pick({
            sentAt: true,
            paidAt: true,
            billingAddress: true,
            notes: true,
            subtotalCents: true,
            taxCents: true,
            totalCents: true,
          })
          .partial()
          .optional(),
      })
    )
    .output(invoiceSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_INVOICE_STATUS(
          input.invoiceId,
          input.status,
          input.additionalFields
        )
    ),

  addItem: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        item: invoiceItemSchema.omit({
          invoiceId: true,
          createdAt: true,
          updatedAt: true,
        }),
      })
    )
    .output(invoiceItemSchema)
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.ADD_INVOICE_ITEM(input.invoiceId, input.item)
    ),

  updateItem: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        lineId: z.string(),
        item: invoiceItemSchema
          .omit({
            invoiceId: true,
            lineId: true,
            createdAt: true,
            updatedAt: true,
          })
          .partial(),
      })
    )
    .output(invoiceItemSchema.nullable())
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.UPDATE_INVOICE_ITEM(
          input.invoiceId,
          input.lineId,
          input.item
        )
    ),

  removeItem: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        lineId: z.string(),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(
      async ({ input }) =>
        await MUTATIONS.ADMIN.REMOVE_INVOICE_ITEM(input.invoiceId, input.lineId)
    ),
});
