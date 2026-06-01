import "server-only";

import { and, desc, eq, gte, lte, type SQL, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import type { InvoiceStatus } from "@/db/types";

export const getInvoices = cache(
  async ({
    organizationId,
    status,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  }: {
    organizationId?: string;
    status?: InvoiceStatus;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}) => {
    "use cache";
    cacheLife("minutes");
    // Joins related orders, so order mutations must invalidate this too.
    cacheTag("invoices", "orders");

    const conditions: (SQL<unknown> | undefined)[] = [];

    if (organizationId) {
      conditions.push(eq(invoices.orgId, organizationId));
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (dateFrom) {
      conditions.push(
        gte(
          sql`COALESCE(${invoices.issuedAt}, ${invoices.createdAt})`,
          dateFrom
        )
      );
    }

    if (dateTo) {
      conditions.push(
        lte(sql`COALESCE(${invoices.issuedAt}, ${invoices.createdAt})`, dateTo)
      );
    }

    return await db.query.invoices.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        organization: {
          columns: { id: true, name: true },
        },
        orders: {
          columns: { id: true, orderNumber: true, totalCents: true },
        },
      },
      orderBy: [desc(invoices.createdAt)],
      limit,
      offset,
    });
  }
);

export const getInvoiceById = cache(async (id: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("invoices", "orders");

  return await db.query.invoices.findFirst({
    where: (inv, { eq: eqOp }) => eqOp(inv.id, id),
    with: {
      organization: true,
      orders: {
        with: {
          items: {
            with: {
              product: {
                columns: { id: true, name: true, slug: true },
              },
            },
          },
        },
      },
    },
  });
});
