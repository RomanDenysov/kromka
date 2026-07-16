import { redirect } from "next/navigation";

// Profitability is the only report; skip the landing hub and open the
// product report directly. Detail-level profitability now lives on each
// store/product page.
export default function ReportsLandingPage() {
  redirect("/admin/reports/products");
}
