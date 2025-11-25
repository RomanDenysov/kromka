"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  PackageIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/db/schema/orders";
import { formatPrice, getInitials } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface OrderDetailProps {
  orderId: string;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cart: "Košík",
  new: "Nová",
  in_progress: "Spracováva sa",
  ready_for_pickup: "Pripravená",
  completed: "Dokončená",
  cancelled: "Zrušená",
  refunded: "Vrátená",
};

const ORDER_STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  cart: <PackageIcon className="size-4" />,
  new: <PackageIcon className="size-4" />,
  in_progress: <TruckIcon className="size-4" />,
  ready_for_pickup: <MapPinIcon className="size-4" />,
  completed: <CheckCircle2Icon className="size-4" />,
  cancelled: <XCircleIcon className="size-4" />,
  refunded: <XCircleIcon className="size-4" />,
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Čaká na platbu",
  paid: "Zaplatená",
  failed: "Zlyhala",
  refunded: "Vrátená",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  in_store: "V predajni",
  card: "Kartou",
  invoice: "Faktúra",
  other: "Iné",
};

const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  pending: "outline",
  paid: "success",
  failed: "destructive",
  refunded: "secondary",
};

// Define which statuses are part of the main workflow
const WORKFLOW_STATUSES: OrderStatus[] = [
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
];

export function OrderDetail({ orderId }: OrderDetailProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: order } = useSuspenseQuery(
    trpc.admin.orders.byId.queryOptions({ id: orderId })
  );

  const { mutate: updateStatus, isPending: isUpdating } = useMutation(
    trpc.admin.orders.updateStatus.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.orders.byId.queryOptions({ id: orderId })
            .queryKey,
        });
        toast.success("Stav objednávky bol aktualizovaný");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  if (!order) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Objednávka nebola nájdená</p>
      </div>
    );
  }

  const currentStatusIndex = WORKFLOW_STATUSES.indexOf(order.orderStatus);
  const isCancelledOrRefunded =
    order.orderStatus === "cancelled" || order.orderStatus === "refunded";

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== order.orderStatus) {
      updateStatus({
        id: orderId,
        status: newStatus as OrderStatus,
      });
    }
  };

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header with order number and status badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">
            Objednávka #{order.orderNumber ?? order.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground text-sm">
            Vytvorená {format(order.createdAt, "d. MMMM yyyy 'o' HH:mm", { locale: sk })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="capitalize"
            variant={isCancelledOrRefunded ? "destructive" : "default"}
          >
            {ORDER_STATUS_LABELS[order.orderStatus]}
          </Badge>
          <Badge variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus]}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </div>

      {/* Status Stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stav objednávky</CardTitle>
          <CardDescription>
            Kliknite na krok pre zmenu stavu objednávky
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCancelledOrRefunded ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <XCircleIcon className="size-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Objednávka bola {order.orderStatus === "cancelled" ? "zrušená" : "vrátená"}
                </p>
                <p className="text-muted-foreground text-sm">
                  Stav objednávky už nie je možné zmeniť
                </p>
              </div>
            </div>
          ) : (
            <Stepper
              defaultValue={order.orderStatus}
              nonInteractive={isUpdating}
              onValueChange={handleStatusChange}
              orientation="horizontal"
            >
              <StepperList>
                {WORKFLOW_STATUSES.map((status, index) => {
                  const isCompleted = currentStatusIndex > index;
                  const isCurrent = order.orderStatus === status;

                  return (
                    <StepperItem
                      completed={isCompleted}
                      disabled={isUpdating}
                      key={status}
                      value={status}
                    >
                      <StepperTrigger className="flex-col gap-2">
                        <StepperIndicator>
                          {ORDER_STATUS_ICONS[status]}
                        </StepperIndicator>
                        <div className="flex flex-col items-center text-center">
                          <StepperTitle
                            className={isCurrent ? "text-primary" : ""}
                          >
                            {ORDER_STATUS_LABELS[status]}
                          </StepperTitle>
                        </div>
                      </StepperTrigger>
                      <StepperSeparator />
                    </StepperItem>
                  );
                })}
              </StepperList>
            </Stepper>
          )}

          {/* Quick action buttons */}
          {!isCancelledOrRefunded && (
            <div className="mt-6 flex flex-wrap gap-2">
              {order.orderStatus !== "cancelled" && (
                <Button
                  disabled={isUpdating}
                  onClick={() => updateStatus({ id: orderId, status: "cancelled" })}
                  size="sm"
                  variant="outline"
                >
                  <XCircleIcon />
                  Zrušiť objednávku
                </Button>
              )}
              {order.paymentStatus === "paid" &&
                order.orderStatus !== "refunded" && (
                  <Button
                    disabled={isUpdating}
                    onClick={() => updateStatus({ id: orderId, status: "refunded" })}
                    size="sm"
                    variant="outline"
                  >
                    Vrátiť platbu
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Produkty ({totalItems} {totalItems === 1 ? "položka" : totalItems < 5 ? "položky" : "položiek"})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead className="text-right">Cena/ks</TableHead>
                  <TableHead className="text-center">Množstvo</TableHead>
                  <TableHead className="text-right">Spolu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.product?.name ?? item.productSnapshot?.name ?? "Neznámy produkt"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {item.productId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}×
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(item.total || item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold" colSpan={3}>
                    Celkom
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(order.totalCents ?? 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Order Info */}
        <div className="flex flex-col gap-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="size-4" />
                Zákazník
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.createdBy ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={order.createdBy.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(order.createdBy.name ?? order.createdBy.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {order.createdBy.name ?? "Bez mena"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {order.createdBy.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Neznámy zákazník</p>
              )}
            </CardContent>
          </Card>

          {/* Pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon className="size-4" />
                Vyzdvihnutie
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.store ? (
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <MapPinIcon className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">{order.store.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {order.store.slug}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Predajňa neurčená</p>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Dátum</p>
                    <p className="font-medium text-sm">
                      {order.pickupDate
                        ? format(order.pickupDate, "d. MMMM yyyy", { locale: sk })
                        : "Neurčený"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Čas</p>
                    <p className="font-medium text-sm">
                      {order.pickupTime ?? "Neurčený"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCardIcon className="size-4" />
                Platba
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Metóda</span>
                <span className="font-medium text-sm">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Stav</span>
                <Badge
                  size="sm"
                  variant={PAYMENT_STATUS_VARIANTS[order.paymentStatus]}
                >
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
              {order.paymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">ID platby</span>
                  <span className="font-mono text-sm">{order.paymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status History */}
      {order.statusEvents && order.statusEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">História zmien stavu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {order.statusEvents.map((event, index) => (
                <div
                  className="flex items-start gap-4"
                  key={event.id}
                >
                  <div
                    className={`relative flex flex-col items-center ${index !== order.statusEvents.length - 1 ? "after:absolute after:top-7 after:h-full after:w-px after:bg-border" : ""}`}
                  >
                    <div className="flex size-7 items-center justify-center rounded-full border bg-background">
                      {ORDER_STATUS_ICONS[event.status]}
                    </div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ORDER_STATUS_LABELS[event.status]}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {format(event.createdAt, "d. MMM yyyy HH:mm", { locale: sk })}
                      </span>
                    </div>
                    {event.createdBy && (
                      <p className="text-muted-foreground text-sm">
                        {event.createdBy.name ?? event.createdBy.email}
                      </p>
                    )}
                    {event.note && (
                      <p className="mt-1 text-muted-foreground text-sm">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

