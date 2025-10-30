import { assertPermission } from "@/lib/auth/rbac";

export default async function B2BPage() {
  await assertPermission("b2b.read");
  return <div>B2B</div>;
}
