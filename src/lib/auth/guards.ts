import { forbidden, redirect, unauthorized } from "next/navigation";
import { getUser, getUserDetails } from "./session";

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

/**
 * Require user to be a member of a B2B organization.
 * Redirects to /b2b if not authenticated or not a member.
 */
export async function requireB2bMember() {
  const userDetails = await getUserDetails();

  if (!userDetails) {
    redirect("/b2b");
  }

  if (!userDetails.members || userDetails.members.length === 0) {
    redirect("/b2b");
  }

  // Get the first organization (users typically have one active org)
  const organization = userDetails.members[0]?.organization;
  if (!organization) {
    redirect("/b2b");
  }

  return {
    user: userDetails,
    organization,
    priceTierId: organization.priceTierId,
  };
}
