"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/client";
import { useCustomerDataStore } from "./customer-data-store";

export function CustomerDataSync() {
  const { data: session, isPending } = useSession();
  const customer = useCustomerDataStore((state) => state.customer);
  const setCustomer = useCustomerDataStore(
    (state) => state.actions.setCustomer
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      if (customer) {
        setCustomer(null);
      }
      return;
    }

    const serverUser = session?.user;

    if (serverUser && serverUser.id !== customer?.id) {
      setCustomer({
        id: serverUser.id,
        name: serverUser.name,
        email: serverUser.email,
        image: serverUser.image ?? null,
        isAnonymous: !!serverUser.isAnonymous,
      });
    }
  }, [isPending, customer, setCustomer]);

  return null;
}
