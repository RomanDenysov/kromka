import { getAdminSidebarBadges } from "@/features/admin-sidebar/api/queries";
import MainSidebar from "@/widgets/admin-sidebar/main-sidebar";

export async function AdminSidebar() {
  const badges = await getAdminSidebarBadges();

  return <MainSidebar badges={badges} />;
}
