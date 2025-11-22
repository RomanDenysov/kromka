import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";
import { headers as nextHeaders } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, type Session } from "@/lib/auth/server";

const DEV_WAIT_MS = 100;
const DEV_WAIT_MS_MAX = 400;

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

export const t = initTRPC.context<CreateTRPCContextOptions>().create({
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

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * DEV_WAIT_MS_MAX) + DEV_WAIT_MS;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  // biome-ignore lint/suspicious/noConsole: Development debugging
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const sessionMiddleware = t.middleware(({ ctx, next, path }) => {
  if (!(ctx.session?.session && ctx.session.user)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `[Session Procedure] Unauthorized for path: ${path}`,
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const protectedMiddleware = t.middleware(({ ctx, next, path }) => {
  if (
    !(ctx.session?.session && ctx.session.user) ||
    ctx.session.user.isAnonymous
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `[Protected Procedure] Unauthorized for path: ${path}`,
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const sessionProcedure = t.procedure
  .use(timingMiddleware)
  .use(sessionMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(protectedMiddleware);

export const roleProcedure = (role: string) =>
  protectedProcedure.use(({ ctx, next, path }) => {
    if (ctx.session?.user?.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `[Role Procedure] Forbidden for path: ${path}`,
      });
    }
    return next();
  });
