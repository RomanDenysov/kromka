import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, magicLink, organization } from "better-auth/plugins";

import { db } from "@/db";
// biome-ignore lint/performance/noNamespaceImport: we need to import the schema to use the database
import * as schema from "@/db/schema/auth";
import { sendEmail } from "../email";
import { createId } from "../ids";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true, // to fix the schema naming convention
  }),
  plugins: [
    anonymous(),
    admin(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail.magicLink({ email, url });
      },
    }),
    nextCookies(),
  ],
  advanced: {
    generateId: createId,
  },
});

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
