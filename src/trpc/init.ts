import { initTRPC, TRPCError } from "@trpc/server";
import { headers as nextHeaders } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, type Session } from "@/lib/auth/server";

export type CreateTRPCContextOptions = {
  session: Session | null;
};

export const createTRPCContext = cache(
  async ({
    headers,
  }: {
    headers?: Headers;
  }): Promise<CreateTRPCContextOptions> => {
    let hdrs: Headers | undefined = headers;
    if (!hdrs) {
      try {
        const ro = await nextHeaders();
        const h = new Headers();
        // biome-ignore lint/suspicious/useIterableCallbackReturn: need to copy headers
        ro.forEach((value, key) => h.append(key, value));
        hdrs = h;
        // biome-ignore lint/suspicious/noEmptyBlockStatements: headers may not be available in all contexts
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
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
