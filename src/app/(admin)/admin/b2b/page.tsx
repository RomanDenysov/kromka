import { assertPerm } from "@/lib/auth/rbac";

export default async function B2BPage() {
  await assertPerm("b2b.read");
  return <div>B2B</div>;
}
