import { resolveAdminBadges } from "@/features/admin-shell/config.server";
import MainSidebar from "@/widgets/admin-sidebar/main-sidebar";

export async function AdminSidebar() {
  const badges = await resolveAdminBadges();

  return <MainSidebar badges={badges} />;
}
