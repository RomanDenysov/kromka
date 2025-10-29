import type { ComponentProps } from "react";
import { Icons } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "./nav";

type Props = ComponentProps<typeof Sidebar> & {
  navigation: NavItem[];
};

export default function AppSidebar({ navigation, ...props }: Props) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Icons.logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.href}>{item.label}</SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
