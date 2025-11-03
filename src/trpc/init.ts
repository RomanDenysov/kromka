import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";
import { headers as nextHeaders } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, type Session } from "@/lib/auth/server";

export type CreateTRPCContextOptions = {
  session: Session | null;
};

/**
 * Server-side context creation for Server Components and server-side prefetch
 */
export const createTRPCContext = cache(
  async (opts?: { headers: Headers }): Promise<CreateTRPCContextOptions> => {
    let hdrs: Headers | undefined = opts?.headers;
    if (!hdrs) {
      try {
        const ro = await nextHeaders();
        const h = new Headers();
        ro.forEach((value, key) => {
          h.append(key, value);
        });
        hdrs = h;
        // biome-ignore lint/suspicious/noEmptyBlockStatements: Ignore empty block statements
      } catch {}
    }

    const session = await auth.api.getSession({
      headers: hdrs ?? new Headers(),
    });

    return { session };
  }
);

const t = initTRPC.context<CreateTRPCContextOptions>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (
    !(ctx.session?.session && ctx.session.user) ||
    ctx.session.user.isAnonymous
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
      cause: ctx.session,
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
