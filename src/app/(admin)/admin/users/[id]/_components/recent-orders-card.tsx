import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  orderStatus: string;
  totalCents: number | null;
};

type Props = {
  recentOrders: Order[];
  totalOrders: number;
  userId: string;
};

export function RecentOrdersCard({ recentOrders, totalOrders, userId }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nedávne objednávky</CardTitle>
            <CardDescription>
              Posledných {recentOrders.length} objednávok
            </CardDescription>
          </div>
          {totalOrders > 10 && (
            <Link
              className="text-primary text-sm hover:underline"
              href={`/admin/orders?userId=${userId}`}
            >
              Zobraziť všetky
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recentOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo objednávky</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Suma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyOrdersState />
        )}
      </CardContent>
    </Card>
  );
}

function OrderRow({ order }: { order: Order }) {
  const statusVariant =
    ORDER_STATUS_VARIANTS[
      order.orderStatus as keyof typeof ORDER_STATUS_VARIANTS
    ] ?? "outline";
  const statusLabel =
    ORDER_STATUS_LABELS[
      order.orderStatus as keyof typeof ORDER_STATUS_LABELS
    ] ?? order.orderStatus;

  return (
    <TableRow>
      <TableCell>
        <Link
          className="font-medium hover:underline"
          href={`/admin/orders/${order.id}`}
        >
          {order.orderNumber}
        </Link>
      </TableCell>
      <TableCell>
        {format(new Date(order.createdAt), "d. M. yyyy", {
          locale: sk,
        })}
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatPrice(order.totalCents ?? 0)}
      </TableCell>
    </TableRow>
  );
}

function EmptyOrdersState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <ShoppingBagIcon className="h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-muted-foreground">
        Používateľ zatiaľ nemá žiadne objednávky
      </p>
    </div>
  );
}
