import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoices } from "@/features/b2b/invoices/queries";
import { formatPrice } from "@/lib/utils";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Návrh", variant: "secondary" },
  issued: { label: "Vystavená", variant: "default" },
  sent: { label: "Odoslaná", variant: "default" },
  paid: { label: "Zaplatená", variant: "default" },
  void: { label: "Zrušená", variant: "destructive" },
};

async function InvoicesLoader() {
  const invoices = await getInvoices();
  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const statusConfig = STATUS_LABELS[invoice.status] ?? {
          label: invoice.status,
          variant: "outline" as const,
        };
        return (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{invoice.invoiceNumber}</CardTitle>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Organizácia:</span>{" "}
                  {invoice.organization?.name ?? "Neznáma"}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Suma:</span>{" "}
                  {formatPrice(invoice.totalCents)}
                </p>
                {invoice.issuedAt && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Vystavená:</span>{" "}
                    {format(new Date(invoice.issuedAt), "d. MMM yyyy", {
                      locale: sk,
                    })}
                  </p>
                )}
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/b2b/invoices/${invoice.id}` as Route}>
                  Detail
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function B2BInvoicesPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Faktúry", href: "/admin/b2b/invoices" as Route },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <InvoicesLoader />
        </Suspense>
      </section>
    </>
  );
}
