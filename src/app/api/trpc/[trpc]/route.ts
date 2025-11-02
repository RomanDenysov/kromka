import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers";

const createContext = async (req: NextRequest) =>
  createTRPCContext({
    headers: req.headers,
  });

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            // biome-ignore lint/suspicious/noConsole: We will use this in development only
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
