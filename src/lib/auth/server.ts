import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink, organization } from "better-auth/plugins";

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
import { sendEmail } from "@/lib/email";
import { createId } from "@/lib/ids";

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
  trustedOrigins: [
    // Production
    "https://pekarenkromka.sk",
    "https://www.pekarenkromka.sk",
    "https://shop.pekarenkromka.sk",

    // Vercel
    "https://kromka.vercel.app",

    // Vercel preview deployments (динамічно)
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),

    // Development
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000"]
      : []),
  ],
  advanced: {
    database: {
      generateId: createId,
    },
    ...(process.env.NODE_ENV === "production" && {
      crossSubDomainCookies: {
        enabled: true,
        domain: "pekarenkromka.sk",
      },
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
