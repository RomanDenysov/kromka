import "server-only";

import type { Period } from "../lib/period";
import { getProductProfitability, getStoreProfitability } from "./queries";

const CSV_NEEDS_QUOTING_RE = /[";\n]/;
const CSV_DOUBLE_QUOTE_RE = /"/g;

/**
 * CSV serializer for Slovak Excel: UTF-8 BOM, semicolon delimiter,
 * decimal comma. Caller wraps with the Response/Content-Disposition.
 */
function escapeCsv(value: string): string {
  if (CSV_NEEDS_QUOTING_RE.test(value)) {
    return `"${value.replace(CSV_DOUBLE_QUOTE_RE, '""')}"`;
  }
  return value;
}

function n(cents: number | null): string {
  if (cents === null) {
    return "";
  }
  return (cents / 100).toFixed(2).replace(".", ",");
}

function pct(value: number | null): string {
  if (value === null) {
    return "";
  }
  return value.toFixed(1).replace(".", ",");
}

const BOM = "﻿";

export async function exportStoreProfitabilityCsv(
  period: Period
): Promise<string> {
  const rows = await getStoreProfitability(period);
  const header = [
    "Predajňa",
    "Objednávky",
    "Tržby (€)",
    "Náklady (€)",
    "Marža (€)",
    "Marža (%)",
    "Objednávky bez nákladov",
  ];
  const lines = [
    header.map(escapeCsv).join(";"),
    ...rows.map((r) =>
      [
        escapeCsv(r.storeName ?? "(bez predajne)"),
        String(r.orderCount),
        n(r.revenueCents),
        n(r.costCents),
        n(r.marginCents),
        pct(r.marginPct),
        String(r.untrackedCostOrderCount),
      ].join(";")
    ),
  ];
  return BOM + lines.join("\n");
}

export async function exportProductProfitabilityCsv(
  period: Period
): Promise<string> {
  const rows = await getProductProfitability(period);
  const header = [
    "Produkt",
    "Kategória",
    "Predané ks",
    "Tržby (€)",
    "Náklady (€)",
    "Marža (€)",
    "Marža (%)",
  ];
  const lines = [
    header.map(escapeCsv).join(";"),
    ...rows.map((r) =>
      [
        escapeCsv(r.productName),
        escapeCsv(r.categoryName ?? ""),
        String(r.quantitySold),
        n(r.revenueCents),
        n(r.costCents),
        n(r.marginCents),
        pct(r.marginPct),
      ].join(";")
    ),
  ];
  return BOM + lines.join("\n");
}
