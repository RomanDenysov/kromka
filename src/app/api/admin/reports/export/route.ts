import { type NextRequest, NextResponse } from "next/server";
import {
  exportProductProfitabilityCsv,
  exportStoreProfitabilityCsv,
} from "@/features/reports/api/exports";
import {
  formatPeriodForFilename,
  resolvePeriod,
} from "@/features/reports/lib/period";
import { requireReportsView } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

const VALID_PRESETS = new Set(["7d", "30d", "90d", "mtd", "ytd", "custom"]);

export async function GET(req: NextRequest) {
  await requireReportsView();

  const url = new URL(req.url);
  const report = url.searchParams.get("report");
  const presetRaw = url.searchParams.get("period") ?? "30d";
  const preset = (VALID_PRESETS.has(presetRaw) ? presetRaw : "30d") as
    | "7d"
    | "30d"
    | "90d"
    | "mtd"
    | "ytd"
    | "custom";

  if (report !== "stores" && report !== "products") {
    return NextResponse.json({ error: "Unknown report" }, { status: 400 });
  }

  const period = resolvePeriod(preset);

  try {
    const csv =
      report === "stores"
        ? await exportStoreProfitabilityCsv(period)
        : await exportProductProfitabilityCsv(period);
    const filename = `reporty-${report === "stores" ? "predajne" : "produkty"}-${formatPeriodForFilename(period)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    log.reports.error({ err, report, preset }, "CSV export failed");
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
