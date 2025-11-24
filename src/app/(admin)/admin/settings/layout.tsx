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
    label: "Používatelia",
    href: "/admin/settings/users",
  },
  {
    label: "Oprávnenia",
    href: "/admin/settings/permissions",
  },
  {
    label: "Konfigurácie",
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
      <div className="relative flex flex-col">
        <SecondaryNav items={items} />

        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
