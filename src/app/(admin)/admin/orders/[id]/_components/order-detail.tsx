"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Stepper,
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
import type { OrderStatus, PaymentStatus } from "@/db/types";
import {
  ORDER_STATUS_ICONS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  WORKFLOW_STATUSES,
} from "@/lib/constants";
import type { Order } from "@/lib/queries/orders";
import { formatPrice, getInitials, getItemsLabel } from "@/lib/utils";
import { useOrderStatusManagement } from "./use-order-status-management";

const ORDER_ID_LENGTH = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Utility Components
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      {children}
    </div>
  );
}

function IconLabel({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Components
// ─────────────────────────────────────────────────────────────────────────────

function OrderHeader({
  orderNumber,
  orderId,
  createdAt,
  orderStatus,
  paymentStatus,
}: {
  orderNumber: string | null;
  orderId: string;
  createdAt: Date;
  orderStatus: OrderStatus;
  paymentStatus: string;
}) {
  const isCancelledOrRefunded =
    orderStatus === "cancelled" || orderStatus === "refunded";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-semibold text-2xl">
          Objednávka #{orderNumber ?? orderId.slice(0, ORDER_ID_LENGTH)}
        </h1>
        <p className="text-muted-foreground text-sm">
          Vytvorená{" "}
          {format(createdAt, "d. MMMM yyyy 'o' HH:mm", { locale: sk })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isCancelledOrRefunded ? "destructive" : "default"}>
          {ORDER_STATUS_LABELS[orderStatus]}
        </Badge>
        <Badge
          variant={
            PAYMENT_STATUS_VARIANTS[
              paymentStatus as keyof typeof PAYMENT_STATUS_VARIANTS
            ]
          }
        >
          {
            PAYMENT_STATUS_LABELS[
              paymentStatus as keyof typeof PAYMENT_STATUS_LABELS
            ]
          }
        </Badge>
      </div>
    </div>
  );
}

function StatusStepperCard({
  orderStatus,
  paymentStatus,
  onStatusChange,
  onValidate,
  isUpdating,
}: {
  orderStatus: OrderStatus;
  paymentStatus: string;
  onStatusChange: (status: OrderStatus) => void;
  onValidate: (status: string) => Promise<boolean>;
  isUpdating: boolean;
}) {
  const currentStatusIndex = WORKFLOW_STATUSES.indexOf(orderStatus);
  const isCancelledOrRefunded =
    orderStatus === "cancelled" || orderStatus === "refunded";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stav objednávky</CardTitle>
        <CardDescription>
          Kliknite na krok pre zmenu stavu objednávky
        </CardDescription>
        <CardAction>
          {!isCancelledOrRefunded && (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isUpdating}
                onClick={async () => {
                  const confirmed = await onValidate("cancelled");
                  if (confirmed) {
                    onStatusChange("cancelled");
                  }
                }}
                size="xs"
                variant="outline"
              >
                <XCircleIcon />
                Zrušiť objednávku
              </Button>
              {paymentStatus === "paid" && (
                <Button
                  disabled={isUpdating}
                  onClick={async () => {
                    const confirmed = await onValidate("refunded");
                    if (confirmed) {
                      onStatusChange("refunded");
                    }
                  }}
                  size="xs"
                  variant="outline"
                >
                  Vrátiť platbu
                </Button>
              )}
            </div>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        {isCancelledOrRefunded ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <XCircleIcon className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Objednávka bola{" "}
                {orderStatus === "cancelled" ? "zrušená" : "vrátená"}
              </p>
              <p className="text-muted-foreground text-sm">
                Stav objednávky už nie je možné zmeniť
              </p>
            </div>
          </div>
        ) : (
          <Stepper
            nonInteractive={isUpdating}
            onValidate={onValidate}
            onValueChange={(v) => onStatusChange(v as OrderStatus)}
            orientation="horizontal"
            value={orderStatus}
          >
            <StepperList>
              {WORKFLOW_STATUSES.map((status, index) => {
                const Icon =
                  ORDER_STATUS_ICONS[status as keyof typeof ORDER_STATUS_ICONS];
                return (
                  <StepperItem
                    completed={currentStatusIndex > index}
                    disabled={isUpdating}
                    key={status}
                    value={status}
                  >
                    <StepperTrigger className="flex-col gap-2">
                      <StepperIndicator>
                        <Icon className="size-4" />
                      </StepperIndicator>
                      <div className="flex flex-col items-center text-center">
                        <StepperTitle
                          className={
                            orderStatus === status ? "text-primary" : ""
                          }
                        >
                          {
                            ORDER_STATUS_LABELS[
                              status as keyof typeof ORDER_STATUS_LABELS
                            ]
                          }
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
      </CardContent>
    </Card>
  );
}

type OrderItemData = {
  productId: string;
  price: number;
  quantity: number;
  productSnapshot: { name: string } | null;
  product: { id: string; name: string } | null;
};

function ProductsCard({ items }: { items: OrderItemData[] }) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const itemsLabel = getItemsLabel(totalItems);

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <h3 className="text-base">
          Produkty ({totalItems} {itemsLabel})
        </h3>
      </CardHeader>
      <CardContent className="h-full">
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
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.product?.name ??
                        item.productSnapshot?.name ??
                        "Neznámy produkt"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {item.productId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(item.price)}
                </TableCell>
                <TableCell className="text-center">{item.quantity}×</TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(item.price * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="mt-auto">
            <TableRow>
              <TableCell className="font-semibold" colSpan={3}>
                Celkom
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(totalPrice)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
} | null;

function CustomerCard({ customer }: { customer: CustomerData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4" />
          Zákazník
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customer ? (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={customer.image ?? undefined} />
              <AvatarFallback>
                {getInitials(customer.name ?? customer.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customer.name ?? "Bez mena"}</p>
              <p className="text-muted-foreground text-sm">{customer.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Neznámy zákazník</p>
        )}
      </CardContent>
    </Card>
  );
}

type StoreData = { id: string; name: string; slug: string } | null;

function PickupCard({
  store,
  pickupDate,
  pickupTime,
}: {
  store: StoreData;
  pickupDate: string | null;
  pickupTime: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPinIcon className="size-4" />
          Vyzdvihnutie
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {store ? (
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-muted p-2">
              <MapPinIcon className="size-4" />
            </div>
            <div>
              <p className="font-medium">{store.name}</p>
              <p className="text-muted-foreground text-sm">{store.slug}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Predajňa neurčená</p>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <IconLabel
            icon={CalendarIcon}
            label="Dátum"
            value={
              pickupDate
                ? format(pickupDate, "d. MMMM yyyy", { locale: sk })
                : "Neurčený"
            }
          />
          <IconLabel
            icon={ClockIcon}
            label="Čas"
            value={pickupTime ?? "Neurčený"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({
  paymentMethod,
  paymentStatus,
  paymentId,
  onPaymentStatusChange,
  onValidatePaymentStatus,
  isUpdating,
}: {
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string | null;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  onValidatePaymentStatus: (status: PaymentStatus) => Promise<boolean>;
  isUpdating: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCardIcon className="size-4" />
          Platba
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <InfoRow label="Metóda">
          <span className="font-medium text-sm">
            {
              PAYMENT_METHOD_LABELS[
                paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
              ]
            }
          </span>
        </InfoRow>
        <InfoRow label="Stav">
          <Select
            disabled={isUpdating}
            onValueChange={async (value) => {
              const confirmed = await onValidatePaymentStatus(
                value as PaymentStatus
              );
              if (confirmed) {
                onPaymentStatusChange(value as PaymentStatus);
              }
            }}
            value={paymentStatus}
          >
            <SelectTrigger className="w-fit" size="sm">
              <SelectValue>
                {
                  PAYMENT_STATUS_LABELS[
                    paymentStatus as keyof typeof PAYMENT_STATUS_LABELS
                  ]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InfoRow>
        {paymentId && (
          <InfoRow label="ID platby">
            <span className="font-mono text-sm">{paymentId}</span>
          </InfoRow>
        )}
      </CardContent>
    </Card>
  );
}

type StatusEventData = {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  note: string | null;
  createdBy: { id: string; name: string | null; email: string } | null;
};

function StatusHistoryCard({ events }: { events: StatusEventData[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">História zmien stavu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {events.map((event, index) => {
            const Icon =
              ORDER_STATUS_ICONS[
                event.status as keyof typeof ORDER_STATUS_ICONS
              ];
            const isLast = index === events.length - 1;

            return (
              <div className="flex items-start gap-4" key={event.id}>
                <div
                  className={`relative flex flex-col items-center ${
                    isLast
                      ? ""
                      : "after:absolute after:top-7 after:h-full after:w-px after:bg-border"
                  }`}
                >
                  <div className="flex size-7 items-center justify-center rounded-full border bg-background">
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {
                        ORDER_STATUS_LABELS[
                          event.status as keyof typeof ORDER_STATUS_LABELS
                        ]
                      }
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {format(event.createdAt, "d. MMM yyyy HH:mm", {
                        locale: sk,
                      })}
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function OrderDetail({ order }: { order: Order | undefined }) {
  const {
    optimisticOrderStatus,
    optimisticPaymentStatus,
    isPending,
    statusDialog,
    paymentDialog,
    handleStatusChange,
    handlePaymentStatusChange,
  } = useOrderStatusManagement(order);

  if (!order) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Objednávka nebola nájdená</p>
      </div>
    );
  }

  const customerEmail = order.createdBy?.email ?? "zákazník";

  return (
    <div className="flex flex-col gap-6">
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            statusDialog.onCancel();
          }
        }}
        open={statusDialog.isOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmeniť stav objednávky?</AlertDialogTitle>
            <AlertDialogDescription>
              Ste si istí, že chcete zmeniť stav objednávky?{" "}
              <strong>{customerEmail}</strong> dostane e-mail s upozornením o
              zmene stavu objednávky na{" "}
              <strong>
                {statusDialog.pendingStatus
                  ? ORDER_STATUS_LABELS[
                      statusDialog.pendingStatus as keyof typeof ORDER_STATUS_LABELS
                    ]
                  : ""}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={statusDialog.onCancel}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction onClick={statusDialog.onConfirm}>
              Potvrdiť zmenu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            paymentDialog.onCancel();
          }
        }}
        open={paymentDialog.isOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmeniť stav platby?</AlertDialogTitle>
            <AlertDialogDescription>
              Ste si istí, že chcete zmeniť stav platby na{" "}
              <strong>
                {paymentDialog.pendingStatus
                  ? PAYMENT_STATUS_LABELS[
                      paymentDialog.pendingStatus as keyof typeof PAYMENT_STATUS_LABELS
                    ]
                  : ""}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={paymentDialog.onCancel}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction onClick={paymentDialog.onConfirm}>
              Potvrdiť zmenu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderHeader
        createdAt={order.createdAt}
        orderId={order.id}
        orderNumber={order.orderNumber}
        orderStatus={optimisticOrderStatus}
        paymentStatus={optimisticPaymentStatus}
      />

      <StatusStepperCard
        isUpdating={isPending}
        onStatusChange={handleStatusChange}
        onValidate={statusDialog.onValidate}
        orderStatus={optimisticOrderStatus}
        paymentStatus={optimisticPaymentStatus}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ProductsCard items={order.items} />

        <div className="flex flex-col gap-6">
          <CustomerCard customer={order.createdBy} />
          <PickupCard
            pickupDate={order.pickupDate}
            pickupTime={order.pickupTime}
            store={order.store}
          />
          <PaymentCard
            isUpdating={isPending}
            key={order.id}
            onPaymentStatusChange={handlePaymentStatusChange}
            onValidatePaymentStatus={paymentDialog.onValidate}
            paymentId={order.paymentId}
            paymentMethod={order.paymentMethod}
            paymentStatus={optimisticPaymentStatus}
          />
        </div>
      </div>

      {order.statusEvents && <StatusHistoryCard events={order.statusEvents} />}
    </div>
  );
}
