import { redirect } from "next/navigation";
import { ERROR_CODES } from "../errors";
import { type Permission, ROLE_PERMS } from "./permissions";
import { auth, type Session } from "./server";

export type { Permission } from "./permissions";
// biome-ignore lint/performance/noBarrelFile: This file serves as a central export point for auth types
export { ROLE_PERMS } from "./permissions";

export async function assertPermission(
  cookies: string,
  ...perms: Permission[]
) {
  const session = await auth.api.getSession({
    headers: { Cookie: cookies },
  });

  const role = session?.user?.role;

  if (!role) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
  const allowed = new Set(ROLE_PERMS[role] ?? []);
  if (!perms.every((p) => allowed.has(p))) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
}

export async function permissionGuard(
  cookies: string,
  ...perms: Permission[]
): Promise<Session> {
  const session = await auth.api.getSession({
    headers: { Cookie: cookies },
  });
  if (!session) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }

  const role = session.user?.role;
  if (!role) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }

  const allowed = new Set(ROLE_PERMS[role] ?? []);
  if (!perms.every((p) => allowed.has(p))) {
    throw new Error(ERROR_CODES.FORBIDDEN);
  }

  return session;
}
