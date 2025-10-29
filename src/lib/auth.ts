import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, magicLink, organization } from "better-auth/plugins";

import { db } from "@/db";
// biome-ignore lint/performance/noNamespaceImport: <explanation>
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    anonymous(),
    admin(),
    organization(),
    magicLink({
      // biome-ignore lint/suspicious/useAwait: <explanation>
      sendMagicLink: async ({ email, url }) => {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log(`Sending magic link to ${email} with url ${url}`);
      },
    }),
    nextCookies(),
  ],
});
