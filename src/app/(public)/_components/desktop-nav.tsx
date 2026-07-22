import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function DesktopNav() {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle({
              variant: "ghost",
              size: "sm",
            })}
            render={<Link href="/o-nas" />}
          >
            O nás
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle({
              variant: "ghost",
              size: "sm",
            })}
            render={<Link href="/e-shop" />}
          >
            E-shop
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle({
              variant: "ghost",
              size: "sm",
            })}
            render={<Link href="/predajne" />}
          >
            Predajne
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle({
              variant: "ghost",
              size: "sm",
            })}
            render={<Link href="/b2b" />}
          >
            B2B
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
