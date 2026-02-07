import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CheckCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { getOrderById } from "@/features/orders/api/queries";
import { requireB2bMember } from "@/lib/auth/guards";
import { buildFullAddress } from "@/lib/geo-utils";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Potvrdenie B2B objednávky",
  description: "Vaša B2B objednávka bola úspešne vytvorená.",
  robots: { index: false, follow: false },
};

async function B2bOrderConfirmationContent({
  orderId,
}: {
  orderId: string;
}) {
  const b2bContext = await requireB2bMember();
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Verify order belongs to user's organization to prevent IDOR
  if (order.companyId !== b2bContext.organization.id) {
    notFound();
  }

  const deliveryAddress = order.deliveryAddress
    ? buildFullAddress(order.deliveryAddress)
    : null;

  return (
    <div className="container mx-auto flex flex-col items-center gap-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <CheckCircleIcon className="size-16 text-green-500" />
        <h1 className="font-bold text-2xl">Ďakujeme za objednávku!</h1>
        <p className="text-muted-foreground">
          Číslo objednávky: <strong>{order.orderNumber}</strong>
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {order.company && (
          <div className="rounded-md p-4 sm:border">
            <h2 className="mb-2 font-semibold">Organizácia</h2>
            <p>{order.company.name}</p>
          </div>
        )}

        {deliveryAddress && (
          <div className="rounded-md p-4 sm:border">
            <h2 className="mb-2 font-semibold">Adresa doručenia</h2>
            <p>{deliveryAddress}</p>
          </div>
        )}

        <div className="rounded-md p-4 sm:border">
          <h2 className="mb-2 font-semibold">Dátum doručenia</h2>
          <p className="text-muted-foreground text-sm">
            {order.pickupDate
              ? format(order.pickupDate, "d. MMMM yyyy", { locale: sk })
              : "Neurčený"}{" "}
            o {order.pickupTime ? order.pickupTime : "Neurčený"}
          </p>
        </div>

        <div className="rounded-md p-4 sm:border">
          <h2 className="mb-2 font-semibold">Položky</h2>
          {order.items.map((item) => (
            <div className="flex justify-between py-1" key={item.productId}>
              <span>
                {item.quantity}× {item.productSnapshot?.name}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Spolu</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <Link
          className={buttonVariants({ variant: "default", className: "w-full" })}
          href="/b2b/shop"
        >
          Pokračovať v nákupe
        </Link>
      </div>
    </div>
  );
}

export default function B2bOrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="container mx-auto py-12">Načítavam...</div>}
    >
      <B2bOrderConfirmationWrapper params={params} />
    </Suspense>
  );
}

async function B2bOrderConfirmationWrapper({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <B2bOrderConfirmationContent orderId={orderId} />;
}
