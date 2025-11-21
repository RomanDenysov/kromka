"use client";

import { useEffect } from "react";
import { signIn, useSession } from "./client";

export function AnonymousProvider() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!(isPending || session)) {
      // biome-ignore lint/complexity/noVoid: we need to wait for the anonymous session to be created
      void signIn.anonymous();
    }
  }, [isPending, session]);

  return null;
}
