import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import {
  SecondaryNav,
  type Item as SecondaryNavItem,
} from "@/components/secondary-nav";

type Props = {
  readonly children: ReactNode;
};

const items: SecondaryNavItem[] = [
  {
    label: "Users",
    href: "/admin/settings/users",
  },
  {
    label: "Roles",
    href: "/admin/settings/roles",
  },
  {
    label: "Permissions",
    href: "/admin/settings/permissions",
  },
  {
    label: "Configurations",
    href: "/admin/settings/configurations",
  },
];

export default function SettingsLayout({ children }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Nastavenia", href: "/admin/settings" },
        ]}
      />
      <div className="flex flex-col">
        <SecondaryNav items={items} />

        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
