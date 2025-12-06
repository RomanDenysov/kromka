"use client";

import { useEffect } from "react";
import { signIn, useSession } from "./client";

export function AnonymousProvider() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!(isPending || session)) {
      // biome-ignore lint/complexity/noVoid: we need to wait for the anonymous session to be created
      void signIn.anonymous().catch(() => {
        // We intentionally swallow anonymous sign-in errors;
        // cart and checkout flows will still validate auth on the server.
        // biome-ignore lint/suspicious/noConsole: we want to see anonymous auth issues in the console for now
        console.error("Anonymous sign-in failed");
      });
    }
  }, [isPending, session]);

  return null;
}
