import { forbidden, unauthorized } from "next/navigation";
import { getUser } from "./session";

const STAFF_ROLES = ["admin", "manager"];

export async function requireAdmin() {
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  if (user.role !== "admin") {
    forbidden();
  }

  return user;
}

export async function requireAuth() {
  const user = await getUser();

  // TODO: Check if we need to redirect to login page or just return 'unauthorized'
  if (!user) {
    unauthorized();
  }
  return user;
}

export async function requireStaff() {
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  if (!STAFF_ROLES.includes(user.role) || user.role === "user") {
    forbidden();
  }

  return user;
}
