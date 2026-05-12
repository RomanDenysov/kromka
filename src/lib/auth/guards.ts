import { forbidden, redirect, unauthorized } from "next/navigation";
import { getUser, getUserDetails } from "./session";

export const STAFF_ROLES = ["admin", "manager"] as const;

function isStaffRole(role: string): role is (typeof STAFF_ROLES)[number] {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Resource-scoped guard: enforce that the user holds one of the listed roles.
 * Foundation for the per-resource guards below; lets us tweak who sees what
 * without grep-and-replacing across feature code.
 */
async function requireRoles(allowed: readonly string[]) {
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  if (!allowed.includes(user.role)) {
    forbidden();
  }

  return user;
}

export function requireAdmin() {
  return requireRoles(["admin"]);
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

  if (!isStaffRole(user.role)) {
    forbidden();
  }

  return user;
}

// --- Resource-scoped guards (recipe-costing arc, pre-A scaffolding) ---
//
// These wrap `requireRoles` with a per-resource semantic name so when the
// `baker` role lands in ERP Phase 4, we only edit the `requireRecipeView`
// allow-list — no churn across feature modules.

export const requireProductEdit = () => requireRoles(STAFF_ROLES);
export const requireRecipeView = () => requireRoles(STAFF_ROLES); // baker added in Phase 4
export const requireRecipeEdit = () => requireRoles(STAFF_ROLES);
export const requireCostView = () => requireRoles(STAFF_ROLES);
export const requireIngredientEdit = () => requireRoles(STAFF_ROLES);
export const requireReportsView = () => requireRoles(STAFF_ROLES);

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
