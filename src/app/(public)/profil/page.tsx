import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  ShoppingBagIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/queries/profile";
import { formatPrice } from "@/lib/utils";

const RECENT_ORDERS_COUNT = 3;

async function ProfilPageContent() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const orders = await getUserOrders(user.id);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);
  const recentOrders = orders.slice(0, RECENT_ORDERS_COUNT);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl">Vitajte späť, {user.name}!</h1>
        <p className="text-muted-foreground">
          Tu je prehľad vášho účtu a posledných aktivít.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Celkové objednávky
            </CardTitle>
            <PackageIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalOrders}</div>
            <p className="text-muted-foreground text-xs">
              {totalOrders === 1
                ? "objednávka"
                : // biome-ignore lint/style/noNestedTernary: TODL: fix later
                  totalOrders >= 2 && totalOrders <= 4
                  ? "objednávky"
                  : "objednávok"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Celková útrata
            </CardTitle>
            <ShoppingBagIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{formatPrice(totalSpent)}</div>
            <p className="text-muted-foreground text-xs">Celkové výdavky</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Členstvo od</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {format(user.createdAt, "MMM yyyy", { locale: sk })}
            </div>
            <p className="text-muted-foreground text-xs">
              {format(user.createdAt, "d. MMMM yyyy", { locale: sk })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Posledné objednávky</CardTitle>
              <CardDescription>Vaše najnovšie objednávky</CardDescription>
            </div>
            {orders.length > 0 && (
              <Link
                className="font-medium text-primary text-sm hover:underline"
                href="/profil/objednavky"
              >
                Zobraziť všetky
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <PackageIcon className="size-12 text-muted-foreground/50" />
              <div>
                <p className="font-medium">Zatiaľ žiadne objednávky</p>
                <p className="text-muted-foreground text-sm">
                  Po vytvorení objednávky sa tu zobrazia.
                </p>
              </div>
              <Link
                className="font-medium text-primary text-sm hover:underline"
                href="/e-shop"
              >
                Prejsť do e-shopu
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <Link
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                  href={`/profil/objednavky/${order.id}` as Route}
                  key={order.id}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{order.orderNumber}</span>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPinIcon className="size-3" />
                      {order.store?.name ?? "Neurčená predajňa"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold">
                      {formatPrice(order.totalCents)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {format(order.createdAt, "d. MMM yyyy", { locale: sk })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
          href="/e-shop"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <ShoppingBagIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Nakupovať</p>
            <p className="text-muted-foreground text-sm">
              Preskúmajte naše produkty
            </p>
          </div>
        </Link>

        <Link
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
          href="/predajne"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <MapPinIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Naše predajne</p>
            <p className="text-muted-foreground text-sm">
              Nájdite najbližšiu predajňu
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilPageContent />
    </Suspense>
  );
}
