import { redirect } from "next/navigation";
import { getSession } from "../get-session";

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
  editor: [
    "admin.read",
    "b2c.read",
    "b2b.read",
    "blog.read",
    "settings.read",
    "users.read",
    "roles.read",
    "config.read",
  ],
  manager: [
    "admin.read",
    "b2c.read",
    "b2b.read",
    "blog.read",
    "settings.read",
    "users.read",
    "roles.read",
    "config.read",
  ],
};

export async function assertPerm(...perms: Permission[]) {
  const session = await getSession();
  if (!session?.user) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
  // biome-ignore lint/style/noNonNullAssertion: TODO: Fix this later with better typing
  const allowed = new Set(ROLE_PERMS[session.user.role!] ?? []);
  const ok = perms.every((p) => allowed.has(p));
  if (!ok) {
    // TODO: Rewrite it latter with forbidden page
    redirect("/");
  }
}
