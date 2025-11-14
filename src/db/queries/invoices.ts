import "server-only";
import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import type { InvoiceSchema } from "@/validation/invoices";

export const QUERIES = {
  ADMIN: {
    GET_INVOICES: async (filters?: {
      status?: InvoiceSchema["status"];
      companyId?: string;
      createdBy?: string;
    }) =>
      await db.query.invoices.findMany({
        where: (invoice, { eq, and: andFn }) => {
          const conditions: SQL[] = [];
          if (filters?.status) {
            conditions.push(eq(invoice.status, filters.status));
          }
          if (filters?.companyId) {
            conditions.push(eq(invoice.companyId, filters.companyId));
          }
          if (filters?.createdBy) {
            conditions.push(eq(invoice.createdBy, filters.createdBy));
          }
          return conditions.length > 0 ? andFn(...conditions) : undefined;
        },
        with: {
          company: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: (invoice, { desc }) => [desc(invoice.issueDate)],
      }),

    GET_INVOICE_BY_ID: async (id: string) =>
      await db.query.invoices.findFirst({
        where: (invoice, { eq }) => eq(invoice.id, id),
        with: {
          company: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),

    GET_INVOICE_BY_NUMBER: async (number: string) =>
      await db.query.invoices.findFirst({
        where: (invoice, { eq }) => eq(invoice.number, number),
        with: {
          company: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),

    GET_INVOICE_ITEMS: async (invoiceId: string) =>
      await db.query.invoiceItems.findMany({
        where: (item, { eq }) => eq(item.invoiceId, invoiceId),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: (item, { asc }) => [asc(item.lineId)],
      }),
  },
};
