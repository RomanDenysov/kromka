import { useMemo } from "react";
import { userInfoSchema } from "@/features/checkout/schema";
import type { User } from "@/lib/auth/session";

type CustomerData = {
  name: string | null;
  email: string;
  phone: string | null;
} | null;

/**
 * Hook to build and validate user/guest info.
 * Handles both authenticated users (from server) and guests (from Zustand store).
 */
export function useCheckoutValidation({
  user,
  customer,
}: {
  user?: User;
  customer: CustomerData;
}) {
  // Build user info from either auth user or guest customer
  const userInfo = useMemo(() => {
    if (user) {
      return {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      };
    }
    return {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
    };
  }, [user, customer]);

  // Validate user info against schema
  const isUserInfoValid = userInfoSchema.safeParse(userInfo).success;

  return { userInfo, isUserInfoValid };
}
