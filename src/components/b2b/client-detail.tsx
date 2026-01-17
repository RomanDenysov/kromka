"use client";

import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateOrganization } from "@/features/b2b/clients/actions";
import type { OrganizationDetail } from "@/features/b2b/clients/queries";
import type { PriceTier } from "@/features/b2b/price-tiers/queries";
import { formatPrice } from "@/lib/utils";

type Props = {
  organization: OrganizationDetail;
  priceTiers: PriceTier[];
};

function formatAddress(address: OrganizationDetail["billingAddress"]) {
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

export function B2BClientDetail({ organization, priceTiers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [billingName, setBillingName] = useState(
    organization.billingName ?? ""
  );
  const [ico, setIco] = useState(organization.ico ?? "");
  const [dic, setDic] = useState(organization.dic ?? "");
  const [icDph, setIcDph] = useState(organization.icDph ?? "");
  const [billingEmail, setBillingEmail] = useState(
    organization.billingEmail ?? ""
  );
  const [paymentTermDays, setPaymentTermDays] = useState(
    organization.paymentTermDays ?? 14
  );
  const [priceTierId, setPriceTierId] = useState(
    organization.priceTierId ?? ""
  );

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateOrganization({
        organizationId: organization.id,
        billingName: billingName || undefined,
        ico: ico || undefined,
        dic: dic || undefined,
        icDph: icDph || undefined,
        billingEmail: billingEmail || undefined,
        paymentTermDays,
        priceTierId: priceTierId || undefined,
      });

      if (result.success) {
        toast.success("Organizácia bola aktualizovaná");
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
          <h1 className="font-bold text-2xl">{organization.name}</h1>
          <p className="text-muted-foreground text-sm">
            Vytvorená{" "}
            {format(new Date(organization.createdAt), "d. MMMM yyyy", {
              locale: sk,
            })}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Prehľad</TabsTrigger>
          <TabsTrigger value="billing">Fakturácia</TabsTrigger>
          <TabsTrigger value="orders">Objednávky</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Informácie</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldSet className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Cenová skupina</FieldLabel>
                  <FieldContent>
                    {organization.priceTier?.name ?? "Nepriradená"}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Počet členov</FieldLabel>
                  <FieldContent>
                    {organization.members?.length ?? 0}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Počet objednávok</FieldLabel>
                  <FieldContent>
                    {organization.orders?.length ?? 0}
                  </FieldContent>
                </Field>
              </FieldSet>
            </CardContent>
          </Card>

          {organization.members && organization.members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Členovia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {organization.members.map((member) => (
                    <div
                      className="flex items-center justify-between rounded border p-3"
                      key={member.id}
                    >
                      <div>
                        <div className="font-medium">
                          {member.user.name ?? member.user.email}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent className="space-y-4" value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Fakturačné údaje</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldSet className="space-y-4">
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Fakturačný názov</FieldLabel>
                    <Input
                      onChange={(e) => setBillingName(e.target.value)}
                      value={billingName}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>IČO</FieldLabel>
                    <Input
                      onChange={(e) => setIco(e.target.value)}
                      value={ico}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>DIČ</FieldLabel>
                    <Input
                      onChange={(e) => setDic(e.target.value)}
                      value={dic}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>IČ DPH</FieldLabel>
                    <Input
                      onChange={(e) => setIcDph(e.target.value)}
                      value={icDph}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Fakturačný email</FieldLabel>
                    <Input
                      onChange={(e) => setBillingEmail(e.target.value)}
                      type="email"
                      value={billingEmail}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Splatnosť (dni)</FieldLabel>
                    <Input
                      onChange={(e) =>
                        setPaymentTermDays(Number.parseInt(e.target.value, 10))
                      }
                      type="number"
                      value={paymentTermDays.toString()}
                    />
                  </Field>
                </FieldGroup>
                <Field>
                  <FieldLabel>Fakturačná adresa</FieldLabel>
                  <FieldContent>
                    {formatAddress(organization.billingAddress)}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Cenová skupina</FieldLabel>
                  <Select onValueChange={setPriceTierId} value={priceTierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte cenovú skupinu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Žiadna</SelectItem>
                      {priceTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button disabled={isPending} onClick={handleSave} size="lg">
                  Uložiť zmeny
                </Button>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Objednávky</CardTitle>
            </CardHeader>
            <CardContent>
              {organization.orders && organization.orders.length > 0 ? (
                <div className="space-y-2">
                  {organization.orders.map((order) => (
                    <div
                      className="flex items-center justify-between rounded border p-3"
                      key={order.id}
                    >
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-muted-foreground text-sm">
                          {format(new Date(order.createdAt), "d. MMM yyyy", {
                            locale: sk,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatPrice(order.totalCents)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Žiadne objednávky
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
