import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  anonymousClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { env } from "@/env";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    organizationClient(),
    magicLinkClient(),
    anonymousClient(),
  ],
});
