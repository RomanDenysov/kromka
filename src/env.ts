import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    // BETTER_AUTH_URL: z.string().url(),

    EMAIL_HOST: z.string().min(1),
    EMAIL_USER: z.string().email(),
    EMAIL_PASSWORD: z.string().min(1),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    // BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  },
});
