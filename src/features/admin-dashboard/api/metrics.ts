/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
/** biome-ignore-all lint/nursery/noIncrementDecrement: we need to use increment/decrement */
/** biome-ignore-all lint/style/noInferrableTypes: Return types are useful for TypeScript */
"use cache";
import "server-only";

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { and, count, desc, eq, gte, lt, lte, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orders,
  products,
  promoCodes,
  promoCodeUsages,
  stores,
} from "@/db/schema";

// ============================================================================
// SECTION 1: TOP CARDS METRICS
// ============================================================================

/**
 * Weekly revenue with comparison to previous week
 */
export async function getWeeklyRevenue(): Promise<{
  currentWeekCents: number;
  previousWeekCents: number;
  percentChange: number;
}> {
  cacheLife("minutes");
  cacheTag("orders");

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const [currentWeekResult, previousWeekResult] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
      })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          ne(orders.orderStatus, "cancelled"),
          gte(orders.createdAt, currentWeekStart),
          lte(orders.createdAt, currentWeekEnd)
        )
      ),
    db
      .select({
        total: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
      })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          ne(orders.orderStatus, "cancelled"),
          gte(orders.createdAt, previousWeekStart),
          lte(orders.createdAt, previousWeekEnd)
        )
      ),
  ]);

  const currentWeekCents = currentWeekResult[0]?.total ?? 0;
  const previousWeekCents = previousWeekResult[0]?.total ?? 0;

  let percentChange: number;
  if (previousWeekCents === 0) {
    percentChange = currentWeekCents > 0 ? 100 : 0;
  } else {
    percentChange =
      ((currentWeekCents - previousWeekCents) / previousWeekCents) * 100;
  }

  return {
    currentWeekCents,
    previousWeekCents,
    percentChange: Math.round(percentChange * 10) / 10,
  };
}

/**
 * Average order value over the last 30 days
 */
export async function getAverageOrderValue(): Promise<{
  averageCents: number;
  orderCount: number;
  allOrdersAverageCents: number;
  allOrdersCount: number;
}> {
  cacheLife("minutes");
  cacheTag("orders");

  const thirtyDaysAgo = subDays(new Date(), 30);

  const [paidResult, allResult] = await Promise.all([
    db
      .select({
        avgValue: sql<number>`COALESCE(AVG(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
        orderCount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          ne(orders.orderStatus, "cancelled"),
          gte(orders.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select({
        avgValue: sql<number>`COALESCE(AVG(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
        orderCount: count(),
      })
      .from(orders)
      .where(
        and(
          ne(orders.orderStatus, "cancelled"),
          gte(orders.createdAt, thirtyDaysAgo)
        )
      ),
  ]);

  return {
    averageCents: Math.round(paidResult[0]?.avgValue ?? 0),
    orderCount: paidResult[0]?.orderCount ?? 0,
    allOrdersAverageCents: Math.round(allResult[0]?.avgValue ?? 0),
    allOrdersCount: allResult[0]?.orderCount ?? 0,
  };
}

/**
 * Count of orders created in the last 7 days (excluding cancelled)
 */
export async function getOrdersCreatedLast7Days(): Promise<number> {
  cacheLife("minutes");
  cacheTag("orders");

  const sevenDaysAgo = subDays(new Date(), 7);

  const result = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, sevenDaysAgo),
        ne(orders.orderStatus, "cancelled")
      )
    );

  return result[0]?.count ?? 0;
}

/**
 * Tomorrow's orders summary for quick glance
 */
export async function getTomorrowOrdersSummary(): Promise<{
  orderCount: number;
  expectedRevenueCents: number;
  productCount: number;
}> {
  cacheLife("minutes");
  cacheTag("orders");

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [ordersResult, productsResult] = await Promise.all([
    db
      .select({
        orderCount: count(),
        expectedRevenue:
          sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.pickupDate, tomorrow),
          ne(orders.orderStatus, "cancelled")
        )
      ),
    db
      .select({
        totalProducts:
          sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`.mapWith(Number),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.pickupDate, tomorrow),
          ne(orders.orderStatus, "cancelled")
        )
      ),
  ]);

  return {
    orderCount: ordersResult[0]?.orderCount ?? 0,
    expectedRevenueCents: ordersResult[0]?.expectedRevenue ?? 0,
    productCount: productsResult[0]?.totalProducts ?? 0,
  };
}

/**
 * Combined new dashboard metrics for top cards
 */
export async function getNewDashboardMetrics() {
  cacheLife("minutes");
  cacheTag("orders");

  const [
    weeklyRevenue,
    newOrdersCount,
    averageOrderValue,
    tomorrowSummary,
    ordersLast7Days,
  ] = await Promise.all([
    getWeeklyRevenue(),
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.orderStatus, "new"))
      .then((res) => res[0]?.count ?? 0),
    getAverageOrderValue(),
    getTomorrowOrdersSummary(),
    getOrdersCreatedLast7Days(),
  ]);

  return {
    weeklyRevenue,
    newOrdersCount,
    averageOrderValue,
    tomorrowSummary,
    ordersLast7Days,
  };
}

export type NewDashboardMetrics = Awaited<
  ReturnType<typeof getNewDashboardMetrics>
>;

// ============================================================================
// SECTION 2: ATTENTION REQUIRED (Vyžaduje pozornosť)
// ============================================================================

/**
 * Orders that need attention - problematic orders requiring action
 */
export async function getAttentionRequired(): Promise<{
  unprocessedToday: number;
  unpaidOverdue: number;
  notPickedUp: number;
  total: number;
}> {
  cacheLife("minutes");
  cacheTag("orders");

  const today = format(new Date(), "yyyy-MM-dd");
  const threeDaysAgo = subDays(new Date(), 3);
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const [unprocessedToday, unpaidOverdue, notPickedUp] = await Promise.all([
    // Orders for today that are still "new" (not processed)
    db
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.pickupDate, today), eq(orders.orderStatus, "new")))
      .then((res) => res[0]?.count ?? 0),

    // Orders unpaid for more than 3 days
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "pending"),
          lt(orders.createdAt, threeDaysAgo),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]?.count ?? 0),

    // Orders from yesterday+ that are "ready_for_pickup" but not completed
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.orderStatus, "ready_for_pickup"),
          lte(orders.pickupDate, yesterday)
        )
      )
      .then((res) => res[0]?.count ?? 0),
  ]);

  return {
    unprocessedToday,
    unpaidOverdue,
    notPickedUp,
    total: unprocessedToday + unpaidOverdue + notPickedUp,
  };
}

export type AttentionRequired = Awaited<
  ReturnType<typeof getAttentionRequired>
>;

// ============================================================================
// SECTION 3: STORE LOAD (Zaťaženie predajní)
// ============================================================================

/**
 * Orders distribution by store for a given date range
 */
export async function getStoreLoad(days: number = 7): Promise<
  {
    storeId: string;
    storeName: string;
    orderCount: number;
    revenueCents: number;
    percentage: number;
  }[]
> {
  cacheLife("minutes");
  cacheTag("orders", "stores");

  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  const endDate = format(addDays(new Date(), 7), "yyyy-MM-dd"); // Include future orders

  const result = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      orderCount: count(),
      revenueCents: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
        Number
      ),
    })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(
      and(gte(orders.pickupDate, startDate), lte(orders.pickupDate, endDate))
    )
    .groupBy(stores.id, stores.name)
    .orderBy(desc(sql`count(*)`));

  const totalOrders = result.reduce((sum, r) => sum + r.orderCount, 0);

  return result.map((r) => ({
    storeId: r.storeId,
    storeName: r.storeName,
    orderCount: r.orderCount,
    revenueCents: r.revenueCents,
    percentage:
      totalOrders === 0 ? 0 : Math.round((r.orderCount / totalOrders) * 100),
  }));
}

export type StoreLoad = Awaited<ReturnType<typeof getStoreLoad>>;

// ============================================================================
// SECTION 4: POPULAR PICKUP DAYS (Obľúbené dni vyzdvihnutia)
// ============================================================================

/**
 * Heatmap data for popular pickup days
 * Returns order counts by day of week
 */
export async function getPopularPickupDays(days: number = 90): Promise<
  {
    dayOfWeek: number; // 0 = Monday, 6 = Sunday
    dayName: string;
    orderCount: number;
    averageRevenueCents: number;
  }[]
> {
  cacheLife("hours");
  cacheTag("orders");

  const startDate = subDays(new Date(), days);

  const result = await db
    .select({
      dayOfWeek:
        sql<number>`EXTRACT(DOW FROM ${orders.pickupDate}::date)`.mapWith(
          Number
        ),
      orderCount: count(),
      totalRevenue: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
        Number
      ),
    })
    .from(orders)
    .where(
      and(gte(orders.createdAt, startDate), ne(orders.orderStatus, "cancelled"))
    )
    .groupBy(sql`EXTRACT(DOW FROM ${orders.pickupDate}::date)`)
    .orderBy(sql`EXTRACT(DOW FROM ${orders.pickupDate}::date)`);

  const dayNames = [
    "Nedeľa",
    "Pondelok",
    "Utorok",
    "Streda",
    "Štvrtok",
    "Piatok",
    "Sobota",
  ];

  // Reorder to start from Monday (PostgreSQL DOW: 0 = Sunday)
  const reordered = [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const found = result.find((r) => r.dayOfWeek === dow);
    const orderCount = found?.orderCount ?? 0;
    const totalRevenue = found?.totalRevenue ?? 0;

    return {
      dayOfWeek: dow === 0 ? 6 : dow - 1, // Convert to 0 = Monday
      dayName: dayNames[dow],
      orderCount,
      averageRevenueCents:
        orderCount === 0 ? 0 : Math.round(totalRevenue / orderCount),
    };
  });

  return reordered;
}

export type PopularPickupDays = Awaited<
  ReturnType<typeof getPopularPickupDays>
>;

// ============================================================================
// SECTION 5: RETURNING CUSTOMERS (Vracajúci sa zákazníci)
// ============================================================================

/**
 * Customer retention metrics
 */
export async function getCustomerRetention(days: number = 30): Promise<{
  newCustomers: number;
  returningCustomers: number;
  returningPercentage: number;
  averageOrdersPerCustomer: number;
}> {
  cacheLife("hours");
  cacheTag("orders");

  const startDate = subDays(new Date(), days);
  const previousPeriodStart = subDays(new Date(), days * 2);

  // Get all customers who ordered in this period
  const currentPeriodCustomers = await db
    .select({
      customerId: orders.createdBy,
      orderCount: count(),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        ne(orders.orderStatus, "cancelled"),
        sql`${orders.createdBy} IS NOT NULL`
      )
    )
    .groupBy(orders.createdBy);

  // Get customers who had orders before this period
  const previousCustomerIds = await db
    .selectDistinct({ customerId: orders.createdBy })
    .from(orders)
    .where(
      and(
        lt(orders.createdAt, startDate),
        gte(orders.createdAt, previousPeriodStart),
        ne(orders.orderStatus, "cancelled"),
        sql`${orders.createdBy} IS NOT NULL`
      )
    )
    .then((res) => new Set(res.map((r) => r.customerId)));

  let newCustomers = 0;
  let returningCustomers = 0;
  let totalOrders = 0;

  for (const customer of currentPeriodCustomers) {
    if (customer.customerId && previousCustomerIds.has(customer.customerId)) {
      returningCustomers += 1;
    } else {
      newCustomers += 1;
    }
    totalOrders += customer.orderCount;
  }

  const totalCustomers = newCustomers + returningCustomers;

  return {
    newCustomers,
    returningCustomers,
    returningPercentage:
      totalCustomers === 0
        ? 0
        : Math.round((returningCustomers / totalCustomers) * 100),
    averageOrdersPerCustomer:
      totalCustomers === 0
        ? 0
        : Math.round((totalOrders / totalCustomers) * 10) / 10,
  };
}

export type CustomerRetention = Awaited<
  ReturnType<typeof getCustomerRetention>
>;

// ============================================================================
// SECTION 6: PROMO CODE EFFECTIVENESS (Efektivita promo kódov)
// ============================================================================

/**
 * Promo code performance metrics
 */
export async function getPromoCodeEffectiveness(limit: number = 10): Promise<
  {
    promoCodeId: string;
    code: string;
    usageCount: number;
    totalRevenueCents: number;
    totalDiscountCents: number;
    roi: number; // Revenue / Discount ratio
  }[]
> {
  cacheLife("hours");
  cacheTag("orders", "promo-codes");

  const result = await db
    .select({
      promoCodeId: promoCodes.id,
      code: promoCodes.code,
      usageCount: count(),
      totalRevenueCents:
        sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(Number),
      totalDiscountCents:
        sql<number>`COALESCE(sum(${promoCodeUsages.discountCents}), 0)`.mapWith(
          Number
        ),
    })
    .from(promoCodeUsages)
    .innerJoin(promoCodes, eq(promoCodeUsages.promoCodeId, promoCodes.id))
    .innerJoin(orders, eq(promoCodeUsages.orderId, orders.id))
    .where(ne(orders.orderStatus, "cancelled"))
    .groupBy(promoCodes.id, promoCodes.code)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return result.map((r) => ({
    promoCodeId: r.promoCodeId,
    code: r.code,
    usageCount: r.usageCount,
    totalRevenueCents: r.totalRevenueCents,
    totalDiscountCents: r.totalDiscountCents,
    roi:
      r.totalDiscountCents === 0
        ? 0
        : Math.round((r.totalRevenueCents / r.totalDiscountCents) * 10) / 10,
  }));
}

export type PromoCodeEffectiveness = Awaited<
  ReturnType<typeof getPromoCodeEffectiveness>
>;

// ============================================================================
// SECTION 7: GROWTH COMPARISON (Rast)
// ============================================================================

/**
 * Month-over-month growth comparison
 */
export async function getGrowthComparison(): Promise<{
  currentMonth: {
    orders: number;
    revenueCents: number;
    newCustomers: number;
  };
  previousMonth: {
    orders: number;
    revenueCents: number;
    newCustomers: number;
  };
  changes: {
    ordersPercent: number;
    revenuePercent: number;
    customersPercent: number;
  };
}> {
  cacheLife("hours");
  cacheTag("orders");

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    currentMonthData,
    previousMonthData,
    currentNewCustomers,
    previousNewCustomers,
  ] = await Promise.all([
    // Current month orders and revenue
    db
      .select({
        orders: count(),
        revenue: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, currentMonthStart),
          lte(orders.createdAt, currentMonthEnd),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]),

    // Previous month orders and revenue
    db
      .select({
        orders: count(),
        revenue: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, previousMonthStart),
          lte(orders.createdAt, previousMonthEnd),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]),

    // New customers this month (first order ever)
    db
      .selectDistinct({ customerId: orders.createdBy })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, currentMonthStart),
          lte(orders.createdAt, currentMonthEnd),
          ne(orders.orderStatus, "cancelled"),
          sql`${orders.createdBy} IS NOT NULL`,
          sql`${orders.createdBy} NOT IN (
              SELECT DISTINCT created_by FROM orders
              WHERE created_at < ${currentMonthStart}
              AND created_by IS NOT NULL
              AND order_status != 'cancelled'
            )`
        )
      )
      .then((res) => res.length),

    // New customers previous month
    db
      .selectDistinct({ customerId: orders.createdBy })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, previousMonthStart),
          lte(orders.createdAt, previousMonthEnd),
          ne(orders.orderStatus, "cancelled"),
          sql`${orders.createdBy} IS NOT NULL`,
          sql`${orders.createdBy} NOT IN (
              SELECT DISTINCT created_by FROM orders
              WHERE created_at < ${previousMonthStart}
              AND created_by IS NOT NULL
              AND order_status != 'cancelled'
            )`
        )
      )
      .then((res) => res.length),
  ]);

  const calcPercent = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  return {
    currentMonth: {
      orders: currentMonthData?.orders ?? 0,
      revenueCents: currentMonthData?.revenue ?? 0,
      newCustomers: currentNewCustomers,
    },
    previousMonth: {
      orders: previousMonthData?.orders ?? 0,
      revenueCents: previousMonthData?.revenue ?? 0,
      newCustomers: previousNewCustomers,
    },
    changes: {
      ordersPercent: calcPercent(
        currentMonthData?.orders ?? 0,
        previousMonthData?.orders ?? 0
      ),
      revenuePercent: calcPercent(
        currentMonthData?.revenue ?? 0,
        previousMonthData?.revenue ?? 0
      ),
      customersPercent: calcPercent(currentNewCustomers, previousNewCustomers),
    },
  };
}

export type GrowthComparison = Awaited<ReturnType<typeof getGrowthComparison>>;

// ============================================================================
// SECTION 8: SEASONAL TRENDS (Sezónne trendy)
// ============================================================================

/**
 * Products trending up or down compared to previous period
 */
export async function getSeasonalTrends(days: number = 14): Promise<{
  trending: {
    productId: string;
    productName: string;
    currentQuantity: number;
    previousQuantity: number;
    changePercent: number;
  }[];
  declining: {
    productId: string;
    productName: string;
    currentQuantity: number;
    previousQuantity: number;
    changePercent: number;
  }[];
}> {
  cacheLife("hours");
  cacheTag("orders", "products");

  const now = new Date();
  const currentPeriodStart = subDays(now, days);
  const previousPeriodStart = subDays(now, days * 2);
  const previousPeriodEnd = subDays(now, days);

  const [currentPeriod, previousPeriod] = await Promise.all([
    db
      .select({
        productId: products.id,
        productName: products.name,
        quantity: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          gte(orders.createdAt, currentPeriodStart),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .groupBy(products.id, products.name),

    db
      .select({
        productId: products.id,
        productName: products.name,
        quantity: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          gte(orders.createdAt, previousPeriodStart),
          lt(orders.createdAt, previousPeriodEnd),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .groupBy(products.id, products.name),
  ]);

  const previousMap = new Map(
    previousPeriod.map((p) => [p.productId, p.quantity])
  );

  const allProducts = currentPeriod.map((p) => {
    const previousQty = previousMap.get(p.productId) ?? 0;
    const changePercent =
      previousQty === 0
        ? // biome-ignore lint/style/noNestedTernary: Ignore it for now
          p.quantity > 0
          ? 100
          : 0
        : Math.round(((p.quantity - previousQty) / previousQty) * 100);

    return {
      productId: p.productId,
      productName: p.productName,
      currentQuantity: p.quantity,
      previousQuantity: previousQty,
      changePercent,
    };
  });

  // Sort and filter
  const trending = allProducts
    .filter((p) => p.changePercent > 20 && p.currentQuantity >= 3)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const declining = allProducts
    .filter((p) => p.changePercent < -20 && p.previousQuantity >= 3)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return { trending, declining };
}

export type SeasonalTrends = Awaited<ReturnType<typeof getSeasonalTrends>>;

// ============================================================================
// SECTION 9: UNUSED POTENTIAL (Nevyužitý potenciál)
// ============================================================================

/**
 * Active products with no orders in the last N days
 */
export async function getUnusedProducts(days: number = 30): Promise<
  {
    productId: string;
    productName: string;
    lastOrderDate: string | null;
    daysSinceLastOrder: number | null;
  }[]
> {
  cacheLife("hours");
  cacheTag("products", "orders");

  // Get all active products
  const activeProducts = await db
    .select({
      productId: products.id,
      productName: products.name,
    })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.status, "active")));

  // Get last order date for each product
  const lastOrders = await db
    .select({
      productId: orderItems.productId,
      lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(ne(orders.orderStatus, "cancelled"))
    .groupBy(orderItems.productId);

  const lastOrderMap = new Map(
    lastOrders.map((o) => [o.productId, o.lastOrderDate])
  );

  const unusedProducts = activeProducts
    .map((p) => {
      const lastOrderDate = lastOrderMap.get(p.productId);
      const lastOrder = lastOrderDate ? new Date(lastOrderDate) : null;
      const daysSince = lastOrder
        ? Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        productId: p.productId,
        productName: p.productName,
        lastOrderDate: lastOrderDate ?? null,
        daysSinceLastOrder: daysSince,
      };
    })
    .filter(
      (p) => p.daysSinceLastOrder === null || p.daysSinceLastOrder >= days
    )
    .sort((a, b) => {
      if (a.daysSinceLastOrder === null) {
        return -1;
      }
      if (b.daysSinceLastOrder === null) {
        return 1;
      }
      return b.daysSinceLastOrder - a.daysSinceLastOrder;
    });

  return unusedProducts;
}

export type UnusedProducts = Awaited<ReturnType<typeof getUnusedProducts>>;

// ============================================================================
// SECTION 10: FREQUENTLY BOUGHT TOGETHER (Často spolu)
// ============================================================================

/**
 * Product pairs that are frequently ordered together
 */
export async function getFrequentlyBoughtTogether(limit: number = 5): Promise<
  {
    product1Id: string;
    product1Name: string;
    product2Id: string;
    product2Name: string;
    frequency: number;
  }[]
> {
  cacheLife("hours");
  cacheTag("orders", "products");

  const result = await db.execute<{
    product1_id: string;
    product1_name: string;
    product2_id: string;
    product2_name: string;
    frequency: number;
  }>(sql`
    SELECT
      p1.id as product1_id,
      p1.name as product1_name,
      p2.id as product2_id,
      p2.name as product2_name,
      COUNT(*) as frequency
    FROM ${orderItems} oi1
    INNER JOIN ${orderItems} oi2
      ON oi1.order_id = oi2.order_id
      AND oi1.product_id < oi2.product_id
    INNER JOIN ${products} p1 ON oi1.product_id = p1.id
    INNER JOIN ${products} p2 ON oi2.product_id = p2.id
    GROUP BY p1.id, p1.name, p2.id, p2.name
    ORDER BY frequency DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row) => ({
    product1Id: row.product1_id,
    product1Name: row.product1_name,
    product2Id: row.product2_id,
    product2Name: row.product2_name,
    frequency: Number(row.frequency),
  }));
}

export type FrequentlyBoughtTogether = Awaited<
  ReturnType<typeof getFrequentlyBoughtTogether>
>;

// ============================================================================
// SECTION 11: REVENUE COMPARISON (Expected vs Received)
// ============================================================================

/**
 * Comparison of expected vs received revenue
 * Motivates staff to properly update order statuses
 */
export async function getRevenueComparison(days: number = 7): Promise<{
  expectedCents: number;
  receivedCents: number;
  pendingCents: number;
  completionRate: number;
}> {
  cacheLife("minutes");
  cacheTag("orders");

  const startDate = subDays(new Date(), days);

  const result = await db
    .select({
      expected: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
        Number
      ),
      received:
        sql<number>`COALESCE(sum(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalCents} ELSE 0 END), 0)`.mapWith(
          Number
        ),
      pending:
        sql<number>`COALESCE(sum(CASE WHEN ${orders.paymentStatus} = 'pending' THEN ${orders.totalCents} ELSE 0 END), 0)`.mapWith(
          Number
        ),
    })
    .from(orders)
    .where(
      and(gte(orders.createdAt, startDate), ne(orders.orderStatus, "cancelled"))
    );

  const expected = result[0]?.expected ?? 0;
  const received = result[0]?.received ?? 0;
  const pending = result[0]?.pending ?? 0;

  return {
    expectedCents: expected,
    receivedCents: received,
    pendingCents: pending,
    completionRate:
      expected === 0 ? 0 : Math.round((received / expected) * 100),
  };
}

export type RevenueComparison = Awaited<
  ReturnType<typeof getRevenueComparison>
>;

// ============================================================================
// SECTION 12: STORE-SPECIFIC VIEW (For sellers)
// ============================================================================

/**
 * Simplified dashboard data for a specific store
 * Used by store sellers who only need their own store's data
 */
export async function getStoreDashboard(storeId: string): Promise<{
  todayOrders: number;
  todayProducts: number;
  todayRevenueCents: number;
  tomorrowOrders: number;
  tomorrowProducts: number;
  pendingPickup: number;
}> {
  cacheLife("minutes");
  cacheTag("orders", "stores");

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [todayData, tomorrowData, pendingPickup] = await Promise.all([
    // Today's data
    db
      .select({
        orderCount: count(),
        revenue: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
          Number
        ),
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.pickupDate, today),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]),

    // Tomorrow's data
    db
      .select({
        orderCount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.pickupDate, tomorrow),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]),

    // Pending pickup (ready but not completed)
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.orderStatus, "ready_for_pickup")
        )
      )
      .then((res) => res[0]?.count ?? 0),
  ]);

  // Get product counts
  const [todayProducts, tomorrowProducts] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.pickupDate, today),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]?.total ?? 0),

    db
      .select({
        total: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`.mapWith(
          Number
        ),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.storeId, storeId),
          eq(orders.pickupDate, tomorrow),
          ne(orders.orderStatus, "cancelled")
        )
      )
      .then((res) => res[0]?.total ?? 0),
  ]);

  return {
    todayOrders: todayData?.orderCount ?? 0,
    todayProducts,
    todayRevenueCents: todayData?.revenue ?? 0,
    tomorrowOrders: tomorrowData?.orderCount ?? 0,
    tomorrowProducts,
    pendingPickup,
  };
}

export type StoreDashboard = Awaited<ReturnType<typeof getStoreDashboard>>;

// ============================================================================
// COMBINED FULL DASHBOARD
// ============================================================================

/**
 * Get all dashboard data in one call
 * Use this for the main admin dashboard
 */
export async function getFullDashboardData() {
  cacheLife("minutes");
  cacheTag("orders", "products", "stores");

  const [
    metrics,
    attentionRequired,
    storeLoad,
    popularDays,
    customerRetention,
    growthComparison,
    seasonalTrends,
    unusedProducts,
    frequentlyBoughtTogether,
    revenueComparison,
  ] = await Promise.all([
    getNewDashboardMetrics(),
    getAttentionRequired(),
    getStoreLoad(),
    getPopularPickupDays(),
    getCustomerRetention(),
    getGrowthComparison(),
    getSeasonalTrends(),
    getUnusedProducts(),
    getFrequentlyBoughtTogether(),
    getRevenueComparison(),
  ]);

  return {
    metrics,
    attentionRequired,
    storeLoad,
    popularDays,
    customerRetention,
    growthComparison,
    seasonalTrends,
    unusedProducts,
    frequentlyBoughtTogether,
    revenueComparison,
  };
}

export type FullDashboardData = Awaited<
  ReturnType<typeof getFullDashboardData>
>;
