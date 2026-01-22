import "server-only";

import { and, count, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, organizations } from "@/db/schema";

export async function getOrganizations({
  search,
  priceTierId,
  limit = 50,
  offset = 0,
}: {
  search?: string;
  priceTierId?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const conditions: (SQL<unknown> | undefined)[] = [];

  if (search) {
    conditions.push(
      or(
        ilike(organizations.name, `%${search}%`),
        ilike(organizations.billingName ?? "", `%${search}%`),
        ilike(organizations.ico ?? "", `%${search}%`)
      )
    );
  }

  if (priceTierId) {
    conditions.push(eq(organizations.priceTierId, priceTierId));
  }

  const orgs = await db.query.organizations.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      priceTier: {
        columns: { id: true, name: true },
      },
      members: {
        columns: { id: true },
      },
    },
    orderBy: [desc(organizations.createdAt)],
    limit,
    offset,
  });

  // Get order stats for each organization
  const orgIds = orgs.map((org) => org.id);
  const orderStats =
    orgIds.length > 0
      ? await db
          .select({
            orgId: orders.companyId,
            orderCount: count(),
            totalRevenue:
              sql<number>`COALESCE(SUM(${orders.totalCents}), 0)`.as(
                "totalRevenue"
              ),
          })
          .from(orders)
          .where(
            and(
              or(...orgIds.map((id) => eq(orders.companyId, id))),
              eq(orders.paymentStatus, "paid")
            )
          )
          .groupBy(orders.companyId)
      : [];

  const statsMap = new Map(
    orderStats.map((stat) => [
      stat.orgId ?? "",
      {
        orderCount: Number(stat.orderCount) ?? 0,
        totalRevenue: Number(stat.totalRevenue) ?? 0,
      },
    ])
  );

  return orgs.map((org) => ({
    ...org,
    orderCount: statsMap.get(org.id)?.orderCount ?? 0,
    totalRevenue: statsMap.get(org.id)?.totalRevenue ?? 0,
    memberCount: org.members?.length ?? 0,
  }));
}

export function getOrganizationById(id: string) {
  return db.query.organizations.findFirst({
    where: (org, { eq: eqOp }) => eqOp(org.id, id),
    with: {
      priceTier: true,
      members: {
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
      orders: {
        orderBy: desc(orders.createdAt),
        limit: 50,
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
}

export type Organization = NonNullable<
  Awaited<ReturnType<typeof getOrganizations>>[number]
>;

export type OrganizationDetail = NonNullable<
  Awaited<ReturnType<typeof getOrganizationById>>
>;
