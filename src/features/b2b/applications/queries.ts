import "server-only";

import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { b2bApplications } from "@/db/schema";
import type { B2bApplicationStatus } from "@/db/types";

export function getB2bApplications({
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
} = {}) {
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

  return db.query.b2bApplications.findMany({
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

export function getB2bApplicationById(id: string) {
  return db.query.b2bApplications.findFirst({
    where: eq(b2bApplications.id, id),
    with: {
      reviewer: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
}

export type B2bApplication = NonNullable<
  Awaited<ReturnType<typeof getB2bApplicationById>>
>;
