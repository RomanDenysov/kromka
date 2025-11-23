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
