"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneField } from "@/components/forms/fields/phone-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";

const editOrgSchema = z.object({
  name: z.string().min(1, "Meno je povinné").max(150),
  phone: z.string().min(1, "Telefón je povinný").max(16),
});

type EditOrgData = z.infer<typeof editOrgSchema>;

type Props = {
  orgId: string;
  initialName: string;
  initialPhone: string;
  children: React.ReactNode;
};

export function B2bOrgEditSheet({
  orgId,
  initialName,
  initialPhone,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditOrgData>({
    resolver: zodResolver(editOrgSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });

  const onSubmit = (data: EditOrgData) => {
    startTransition(async () => {
      try {
        const { updateOrganization } = await import(
          "@/features/b2b/clients/api/actions"
        );
        const result = await updateOrganization({
          organizationId: orgId,
          billingName: data.name,
        });
        if (result.success) {
          toast.success("Údaje boli aktualizované");
        } else {
          toast.error(result.error ?? "Nepodarilo sa aktualizovať údaje");
        }
      } catch {
        toast.error("Nastala chyba");
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Upraviť údaje</SheetTitle>
          <SheetDescription>
            Upravte kontaktné údaje organizácie.
          </SheetDescription>
        </SheetHeader>
        <FormProvider {...form}>
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <TextField
              inputClassName="w-full max-w-none"
              label="Kontaktné meno"
              maxLength={150}
              name="name"
              placeholder="Ján Novák"
            />
            <PhoneField
              inputClassName="w-full max-w-none"
              label="Telefón"
              name="phone"
            />
            <Button disabled={isPending} type="submit">
              {isPending && <Spinner />}
              Uložiť
            </Button>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
