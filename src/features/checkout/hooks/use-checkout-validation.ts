import { useMemo } from "react";
import type { GuestInfo } from "@/features/checkout/cookies";
import { userInfoSchema } from "@/features/checkout/schema";
import type { User } from "@/lib/auth/session";

/**
 * Hook to build and validate user/guest info.
 * Handles both authenticated users (from server) and guests (from httpOnly cookie).
 */
export function useCheckoutValidation({
  user,
  guestInfo,
}: {
  user?: User;
  guestInfo?: GuestInfo | null;
}) {
  // Build user info from either auth user or guest info
  const userInfo = useMemo(() => {
    if (user) {
      return {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      };
    }
    return {
      name: guestInfo?.name ?? "",
      email: guestInfo?.email ?? "",
      phone: guestInfo?.phone ?? "",
    };
  }, [user, guestInfo]);

  // Validate user info against schema
  const isUserInfoValid = userInfoSchema.safeParse(userInfo).success;

  return { userInfo, isUserInfoValid };
}
