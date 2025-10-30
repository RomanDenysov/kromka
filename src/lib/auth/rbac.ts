import { redirect } from "next/navigation";
import { getRole } from "../get-session";

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
