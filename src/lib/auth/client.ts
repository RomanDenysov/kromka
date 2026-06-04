import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  // Use current origin on preview/staging so OAuth and magic links match the deployment host.
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
  plugins: [adminClient(), organizationClient(), magicLinkClient()],
});
