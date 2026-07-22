import "server-only";

import { and, count, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { b2bApplications } from "@/db/schema";
import type { B2bApplicationStatus } from "@/db/types";

export const getB2bApplications = cache(
  async ({
    status,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  }: {
    status?: B2bApplicationStatus;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("b2b-applications");

    const conditions: (SQL<unknown> | undefined)[] = [];

    if (status) {
      conditions.push(eq(b2bApplications.status, status));
    }

    if (dateFrom) {
      conditions.push(gte(b2bApplications.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(b2bApplications.createdAt, dateTo));
    }

    return await db.query.b2bApplications.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        reviewer: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(b2bApplications.createdAt)],
      limit,
      offset,
    });
  }
);

/** Count of pending B2B applications for admin nav badges. */
export async function getPendingApplicationsCount(): Promise<number> {
  return await db
    .select({ count: count() })
    .from(b2bApplications)
    .where(eq(b2bApplications.status, "pending"))
    .then((res) => res[0]?.count ?? 0);
}

export const getB2bApplicationById = cache(async (id: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("b2b-applications");

  return await db.query.b2bApplications.findFirst({
    where: eq(b2bApplications.id, id),
    with: {
      reviewer: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
});

export type B2bApplication = NonNullable<
  Awaited<ReturnType<typeof getB2bApplicationById>>
>;
