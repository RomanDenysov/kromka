import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, startOfToday } from "date-fns";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type B2bCheckoutFormData,
  b2bCheckoutFormSchema,
} from "@/features/checkout/schema";
import { isBeforeDailyCutoff } from "@/features/checkout/utils";
import { createB2BOrder } from "@/features/orders/actions/create-b2b-order";

type UseB2bCheckoutFormProps = {
  orgId: string;
};

export function useB2bCheckoutForm({ orgId }: UseB2bCheckoutFormProps) {
  const router = useRouter();

  const canOrderForTomorrow = isBeforeDailyCutoff();
  const defaultDate = canOrderForTomorrow
    ? addDays(startOfToday(), 1)
    : addDays(startOfToday(), 2);

  const form = useForm<B2bCheckoutFormData>({
    resolver: zodResolver(b2bCheckoutFormSchema),
    defaultValues: {
      pickupDate: defaultDate,
      pickupTime: "",
      paymentMethod: "in_store",
    },
    mode: "onChange",
  });

  const onSubmit = async (value: B2bCheckoutFormData) => {
    const formattedDate = format(value.pickupDate, "yyyy-MM-dd");

    try {
      const result = await createB2BOrder({
        pickupDate: formattedDate,
        pickupTime: value.pickupTime,
        paymentMethod: value.paymentMethod,
      });

      if (result.success) {
        toast.success("Vaša B2B objednávka bola vytvorená");
        router.push(`/b2b/pokladna/${result.orderId}` as Route);
      } else {
        toast.error(result.error ?? "Nepodarilo sa vytvoriť objednávku");
      }
    } catch {
      toast.error("Nepodarilo sa spojiť so serverom. Skúste to znova.");
    }
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  return {
    form,
    handleFormSubmit,
  };
}
