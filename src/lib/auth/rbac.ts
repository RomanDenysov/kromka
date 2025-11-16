import { redirect } from "next/navigation";
import { ERROR_CODES } from "../errors";
import { auth, type Session } from "./server";

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
