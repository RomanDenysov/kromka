import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  anonymousClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    anonymousClient(),
  ],
});
