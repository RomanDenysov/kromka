"use server";

import { notFound } from "next/navigation";
import { type Permission, ROLE_PERMS } from "@/lib/auth/rbac";
import { getSession } from "@/lib/get-session";
import type { AdminNavNode } from "./nav";
// NOTE: Biome incorrectly flags this import, but NAV is exported from nav.ts (line 39)
// TypeScript compiles successfully, so this is a Biome analyzer bug
import { NAV } from "./nav";

/**
 * Server-side function to get filtered navigation based on user role and permissions
 */
export async function getAdminNav(): Promise<AdminNavNode[]> {
  const session = await getSession();
  if (!session?.user?.role) {
    notFound();
  }

  const role = session.user.role;
  const perms = new Set(ROLE_PERMS[role] ?? []);

  const hasPerm = (perm?: Permission): boolean => !perm || perms.has(perm);

  const filterNode = (node: AdminNavNode): AdminNavNode | null => {
    if (node.type === "item") {
      return hasPerm(node.perm) ? node : null;
    }

    // section
    if (!hasPerm(node.perm)) {
      return null;
    }
    const filteredItems = node.items
      .map((i) => (hasPerm(i.perm) ? i : null))
      .filter(Boolean) as typeof node.items;
    return filteredItems.length > 0 ? { ...node, items: filteredItems } : null;
  };

  return NAV.map(filterNode).filter(Boolean) as AdminNavNode[];
}

/**
 * Server-side function to get badge counts for sidebar items
 * TODO: Replace placeholder queries with actual table queries when schemas are ready
 */
// biome-ignore lint/suspicious/useAwait: This function will have database queries in the future
export async function getBadgeCounts(): Promise<Record<string, number>> {
  // TODO: Replace these with actual database queries when order/invoice/comment tables exist
  // Example:
  // const b2cOrders = await db.select({ count: count() }).from(b2cOrdersTable).where(...);
  // const b2bOrders = await db.select({ count: count() }).from(b2bOrdersTable).where(...);
  // const b2bInvoices = await db.select({ count: count() }).from(b2bInvoicesTable).where(...);
  // const blogComments = await db.select({ count: count() }).from(blogCommentsTable).where(...);

  // For now, return empty counts - you can uncomment and implement actual queries:
  // const [b2cOrdersCount, b2bOrdersCount, b2bInvoicesCount, blogCommentsCount] = await Promise.all([
  //   db.select({ count: sql<number>`count(*)` }).from(b2cOrdersTable),
  //   db.select({ count: sql<number>`count(*)` }).from(b2bOrdersTable),
  //   db.select({ count: sql<number>`count(*)` }).from(b2bInvoicesTable),
  //   db.select({ count: sql<number>`count(*)` }).from(blogCommentsTable),
  // ]);

  return {
    "b2c.orders": 0,
    "b2b.orders": 0,
    "b2b.invoices": 0,
    "blog.comments": 0,
  };
}
