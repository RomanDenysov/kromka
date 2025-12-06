import { PackageIcon, SettingsIcon, UserIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";
import { ProfileNavLink } from "./_components/profile-nav-link";

type Props = {
  readonly children: ReactNode;
};

async function ProfileLayoutContent({ children }: Props) {
  const { user, isAuthenticated } = await getAuth();

  if (!(isAuthenticated && user)) {
    redirect("/prihlasenie?origin=/profil");
  }

  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Profil", href: "/profil" }]} />

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="flex flex-col gap-6">
            {/* User info card */}
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarImage
                  alt={user.name}
                  className="object-cover"
                  src={user.image ?? undefined}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{user.name}</span>
                <span className="text-muted-foreground text-sm">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-1">
              <ProfileNavLink href="/profil">
                <UserIcon className="size-4" />
                Prehľad
              </ProfileNavLink>
              <ProfileNavLink href="/profil/objednavky">
                <PackageIcon className="size-4" />
                Objednávky
              </ProfileNavLink>
              <ProfileNavLink href="/profil/nastavenia">
                <SettingsIcon className="size-4" />
                Nastavenia
              </ProfileNavLink>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </PageWrapper>
  );
}

export default function ProfileLayout({ children }: Props) {
  return (
    <Suspense fallback={<PageWrapper>Loading...</PageWrapper>}>
      <ProfileLayoutContent>{children}</ProfileLayoutContent>
    </Suspense>
  );
}
