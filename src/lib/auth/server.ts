import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, magicLink, organization } from "better-auth/plugins";

import { db } from "@/db";
import {
  accounts,
  invitations,
  members,
  organizations,
  sessions,
  users,
  verifications,
} from "@/db/schema";
import { env } from "@/env";
import { sendEmail } from "../email";
import { createId } from "../ids";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      accounts,
      invitations,
      members,
      organizations,
      verifications,
      sessions,
    },
    usePlural: true, // to fix the schema naming convention
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      updateUserInfoOnLink: true,
    },
  },
  user: {
    additionalFields: {
      storeId: {
        type: "string",
        input: false,
      },
    },
  },
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
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      mapProfileToUser: (profile) => ({
        image: profile.picture,
      }),
    },
  },
  advanced: {
    database: {
      generateId: createId,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
