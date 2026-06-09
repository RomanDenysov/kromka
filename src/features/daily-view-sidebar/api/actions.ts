"use server";

import { cookies } from "next/headers";
import { CONTEXT_RAIL_COOKIE } from "../cookies";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Persist the admin context-rail open state. UI-only preference, so no auth
 * guard is required.
 */
export async function setContextRailOpenAction(open: boolean): Promise<void> {
  (await cookies()).set(CONTEXT_RAIL_COOKIE, String(open), {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}
