"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { useRouter } from "next/navigation";
import {
  Controller,
  FormProvider,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/forms/fields/select-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateOrganization } from "@/features/b2b/clients/actions";
import type { OrganizationDetail } from "@/features/b2b/clients/queries";
import type { PriceTier } from "@/features/b2b/price-tiers/queries";
import { formatPrice } from "@/lib/utils";
import {
  type UpdateOrganizationSchema,
  updateOrganizationSchema,
} from "@/validation/b2b";

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
  const form = useForm<UpdateOrganizationSchema>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      organizationId: organization.id,
      billingName: organization.billingName ?? "",
      ico: organization.ico ?? "",
      dic: organization.dic ?? "",
      icDph: organization.icDph ?? "",
      billingEmail: organization.billingEmail ?? "",
      paymentTermDays: organization.paymentTermDays ?? 14,
      priceTierId: organization.priceTierId ?? "",
    },
  });

  const onSubmit: SubmitHandler<UpdateOrganizationSchema> = async (data) => {
    const result = await updateOrganization(data);

    if (result.success) {
      toast.success("Organizácia bola aktualizovaná");
      router.refresh();
    } else {
      toast.error(result.error ?? "Nastala chyba");
    }
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
              <FormProvider {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit(onSubmit)(e);
                  }}
                >
                  <FieldSet className="space-y-4">
                    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextField label="Fakturačný názov" name="billingName" />
                      <TextField
                        label="IČO"
                        name="ico"
                        placeholder="12345678"
                      />
                      <TextField
                        label="DIČ"
                        name="dic"
                        placeholder="SK1234567890"
                      />
                      <TextField
                        label="IČ DPH"
                        name="icDph"
                        placeholder="SK1234567890"
                      />
                      <TextField
                        autoComplete="email"
                        label="Fakturačný email"
                        name="billingEmail"
                        type="email"
                      />
                      <Controller
                        control={form.control}
                        name="paymentTermDays"
                        render={({ field, fieldState }) => (
                          <Field
                            className="gap-1"
                            data-invalid={fieldState.invalid}
                          >
                            <FieldLabel htmlFor={field.name}>
                              Splatnosť (dni)
                            </FieldLabel>
                            <Input
                              aria-invalid={fieldState.invalid}
                              id={field.name}
                              inputMode="numeric"
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw.length === 0) {
                                  field.onChange(undefined);
                                  return;
                                }
                                const parsed = Number(raw);
                                field.onChange(
                                  Number.isNaN(parsed) ? undefined : parsed
                                );
                              }}
                              type="number"
                              value={field.value ?? ""}
                              volume="xs"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>

                    <Field>
                      <FieldLabel>Fakturačná adresa</FieldLabel>
                      <FieldContent>
                        {formatAddress(organization.billingAddress)}
                      </FieldContent>
                    </Field>

                    <SelectField
                      label="Cenová skupina"
                      name="priceTierId"
                      options={[
                        { value: "", label: "Žiadna" },
                        ...priceTiers.map((tier) => ({
                          value: tier.id,
                          label: tier.name,
                        })),
                      ]}
                      placeholder="Vyberte cenovú skupinu"
                    />

                    <Button
                      disabled={form.formState.isSubmitting}
                      size="lg"
                      type="submit"
                    >
                      {form.formState.isSubmitting
                        ? "Ukladá sa..."
                        : "Uložiť zmeny"}
                    </Button>
                  </FieldSet>
                </form>
              </FormProvider>
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
