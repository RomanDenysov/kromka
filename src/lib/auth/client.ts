import {
  adminClient,
  anonymousClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    anonymousClient(),
  ],
});
