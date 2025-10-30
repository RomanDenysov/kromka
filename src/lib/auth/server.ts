import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, magicLink, organization } from "better-auth/plugins";

import { db } from "@/db";
// biome-ignore lint/performance/noNamespaceImport: <explanation>
import * as schema from "@/db/schema/auth";
import { sendEmail } from "../email";

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
        await sendEmail.magicLink({ email, url });
      },
    }),
    nextCookies(),
  ],
});

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
