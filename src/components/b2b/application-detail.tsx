"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  approveB2bApplication,
  rejectB2bApplication,
} from "@/features/b2b/applications/actions";
import type { B2bApplication } from "@/features/b2b/applications/queries";
import type { PriceTier } from "@/features/b2b/price-tiers/queries";

type Props = {
  application: B2bApplication;
  priceTiers: PriceTier[];
};

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Čaká", variant: "secondary" },
  approved: { label: "Schválená", variant: "default" },
  rejected: { label: "Zamietnutá", variant: "destructive" },
};

function formatAddress(address: B2bApplication["billingAddress"]) {
  if (!address) {
    return "Nevyplnené";
  }
  const parts: string[] = [];
  if (address.street) {
    parts.push(address.street);
  }
  if (address.postalCode || address.city) {
    parts.push([address.postalCode, address.city].filter(Boolean).join(" "));
  }
  if (address.country) {
    parts.push(address.country);
  }
  return parts.length > 0 ? parts.join(", ") : "Nevyplnené";
}

export function B2BApplicationDetail({ application, priceTiers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPriceTierId, setSelectedPriceTierId] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const statusConfig = STATUS_LABELS[application.status] ?? {
    label: application.status,
    variant: "outline" as const,
  };

  const canApprove = application.status === "pending";
  const canReject = application.status === "pending";

  const handleApprove = () => {
    if (!selectedPriceTierId) {
      toast.error("Vyberte cenovú skupinu");
      return;
    }

    startTransition(async () => {
      const result = await approveB2bApplication({
        applicationId: application.id,
        priceTierId: selectedPriceTierId,
      });

      if (result.success) {
        toast.success("Žiadosť bola schválená");
        router.refresh();
      } else {
        toast.error(result.error ?? "Nastala chyba");
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Zadajte dôvod zamietnutia");
      return;
    }

    startTransition(async () => {
      const result = await rejectB2bApplication({
        applicationId: application.id,
        rejectionReason: rejectionReason.trim(),
      });

      if (result.success) {
        toast.success("Žiadosť bola zamietnutá");
        router.refresh();
      } else {
        toast.error(result.error ?? "Nastala chyba");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">{application.companyName}</h1>
          <p className="text-muted-foreground text-sm">
            Žiadosť z{" "}
            {format(new Date(application.createdAt), "d. MMMM yyyy", {
              locale: sk,
            })}
          </p>
        </div>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informácie o spoločnosti</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Názov spoločnosti</FieldLabel>
              <FieldContent>{application.companyName}</FieldContent>
            </Field>
            <Field>
              <FieldLabel>IČO</FieldLabel>
              <FieldContent>{application.ico}</FieldContent>
            </Field>
            {application.dic && (
              <Field>
                <FieldLabel>DIČ</FieldLabel>
                <FieldContent>{application.dic}</FieldContent>
              </Field>
            )}
            {application.icDph && (
              <Field>
                <FieldLabel>IČ DPH</FieldLabel>
                <FieldContent>{application.icDph}</FieldContent>
              </Field>
            )}
          </FieldSet>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktná osoba</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldSet className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Meno a priezvisko</FieldLabel>
              <FieldContent>{application.contactName}</FieldContent>
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${application.contactEmail}`}
                >
                  {application.contactEmail}
                </a>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Telefónne číslo</FieldLabel>
              <FieldContent>
                <a
                  className="text-primary hover:underline"
                  href={`tel:${application.contactPhone}`}
                >
                  {application.contactPhone}
                </a>
              </FieldContent>
            </Field>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Fakturačná adresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldContent>
              {formatAddress(application.billingAddress)}
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      {/* Message */}
      {application.message && (
        <Card>
          <CardHeader>
            <CardTitle>Správa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{application.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Review Information */}
      {application.reviewedAt && (
        <Card>
          <CardHeader>
            <CardTitle>Informácie o kontrole</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Dátum kontroly</FieldLabel>
                <FieldContent>
                  {format(
                    new Date(application.reviewedAt),
                    "d. MMMM yyyy, HH:mm",
                    {
                      locale: sk,
                    }
                  )}
                </FieldContent>
              </Field>
              {application.reviewer && (
                <Field>
                  <FieldLabel>Kontroloval</FieldLabel>
                  <FieldContent>
                    {application.reviewer.name ?? application.reviewer.email}
                  </FieldContent>
                </Field>
              )}
              {application.rejectionReason && (
                <Field className="md:col-span-2">
                  <FieldLabel>Dôvod zamietnutia</FieldLabel>
                  <FieldContent>
                    <p className="whitespace-pre-wrap text-sm">
                      {application.rejectionReason}
                    </p>
                  </FieldContent>
                </Field>
              )}
            </FieldSet>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {canApprove || canReject ? (
        <Card>
          <CardHeader>
            <CardTitle>Akcie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canApprove && (
              <FieldSet>
                <Field>
                  <FieldLabel>Cenová skupina</FieldLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={setSelectedPriceTierId}
                    value={selectedPriceTierId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte cenovú skupinu" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button
                  disabled={isPending || !selectedPriceTierId}
                  onClick={handleApprove}
                  size="lg"
                >
                  <CheckCircleIcon className="mr-2 size-4" />
                  Schváliť žiadosť
                </Button>
              </FieldSet>
            )}

            {canReject && (
              <>
                <Separator />
                {showRejectForm ? (
                  <FieldSet>
                    <Field>
                      <FieldLabel>Dôvod zamietnutia</FieldLabel>
                      <Textarea
                        disabled={isPending}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Zadajte dôvod zamietnutia..."
                        rows={4}
                        value={rejectionReason}
                      />
                      <FieldDescription>
                        Tento dôvod bude odoslaný žiadateľovi emailom.
                      </FieldDescription>
                    </Field>
                    <div className="flex gap-2">
                      <Button
                        disabled={isPending}
                        onClick={handleReject}
                        size="lg"
                        variant="destructive"
                      >
                        <XCircleIcon className="mr-2 size-4" />
                        Zamietnuť žiadosť
                      </Button>
                      <Button
                        disabled={isPending}
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason("");
                        }}
                        size="lg"
                        variant="outline"
                      >
                        Zrušiť
                      </Button>
                    </div>
                  </FieldSet>
                ) : (
                  <Button
                    disabled={isPending}
                    onClick={() => setShowRejectForm(true)}
                    size="lg"
                    variant="destructive"
                  >
                    <XCircleIcon className="mr-2 size-4" />
                    Zamietnuť žiadosť
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
