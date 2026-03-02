"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { TextField } from "@/components/forms/fields/text-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { updatePriceTierAction } from "@/features/b2b/price-tiers/api/actions";
import type { PriceTierDetail } from "@/features/b2b/price-tiers/api/queries";
import {
  type PriceTierSchema,
  priceTierSchema,
} from "@/features/b2b/price-tiers/schema";
import { cn } from "@/lib/utils";

interface Props {
  children: (props: { isPending: boolean }) => ReactNode;
  className?: string;
  tier: PriceTierDetail;
}

export function PriceTierForm({ tier, children, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<PriceTierSchema>({
    resolver: zodResolver(priceTierSchema),
    defaultValues: {
      name: tier.name,
      description: tier.description ?? null,
    },
  });

  const onSubmit = async (data: PriceTierSchema) => {
    const result = await updatePriceTierAction({ id: tier.id, data });
    if (result.success) {
      toast.success("Cenová skupina bola uložená");
    } else {
      toast.error("Nepodarilo sa uložiť cenovú skupinu");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <FieldSet
          className={cn(
            "grid @xl/page:max-w-xl max-w-full gap-6 @lg/page:p-5 @xl/page:p-8 p-4",
            className
          )}
        >
          <FieldGroup className="grid @xl/page:grid-cols-2 grid-cols-1 @xl/page:gap-6 gap-3">
            <TextField label="Názov" name="name" placeholder="Názov skupiny" />
            <TextField
              label="Popis"
              name="description"
              placeholder="Popis cenovej skupiny"
            />
          </FieldGroup>
        </FieldSet>
        {children({ isPending: form.formState.isSubmitting })}
      </form>
    </FormProvider>
  );
}
