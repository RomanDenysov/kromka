import { redirect } from "next/navigation";
import { ERROR_CODES } from "../errors";
import { getRole } from "../get-session";
import { getSession } from "./auth-utils";
import type { Session } from "./server";

export type Permission =
  | "admin.read"
  | "b2c.read"
  | "b2b.read"
  | "blog.read"
  | "settings.read"
  | "users.read"
  | "roles.read"
  | "config.read"
  | "perms.read";

export const ROLE_PERMS: Record<string, Permission[]> = {
  admin: [
    "admin.read",
    "b2c.read",
    "b2b.read",
    "blog.read",
    "settings.read",
    "users.read",
    "roles.read",
    "config.read",
    "perms.read",
  ],
  editor: ["admin.read", "blog.read"],
  manager: ["admin.read", "b2c.read", "b2b.read"],
};

export async function assertPermission(...perms: Permission[]) {
  const role = await getRole();
  if (!role) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
  const allowed = new Set(ROLE_PERMS[role] ?? []);
  const ok = perms.every((p) => allowed.has(p));
  if (!ok) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
}

export async function permissionGuard(
  ...perms: Permission[]
): Promise<Session> {
  const session = await getSession();
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
