import { cookies } from "next/headers";

export const CONTEXT_RAIL_COOKIE = "context_rail_open";

/**
 * Server-side read of the admin context-rail open state.
 * Defaults to open when the cookie is absent.
 */
export async function getContextRailOpen(): Promise<boolean> {
  return (await cookies()).get(CONTEXT_RAIL_COOKIE)?.value !== "false";
}
