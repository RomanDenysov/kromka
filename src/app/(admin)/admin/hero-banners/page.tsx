import { PlusIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getHeroBanners } from "@/features/hero-banners/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { HeroBannersList } from "./_components/hero-banners-list";

async function BannersLoader() {
  const banners = await getHeroBanners();
  return <HeroBannersList banners={banners} />;
}

export default function HeroBannersPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Hero bannery" },
        ]}
      >
        <Button asChild size="sm">
          <Link href={"/admin/hero-banners/new" as Route}>
            <PlusIcon className="size-3.5" />
            Novy banner
          </Link>
        </Button>
      </AdminHeader>
      <section className="@container/page h-full flex-1 p-4">
        <Suspense
          fallback={
            <div className="text-muted-foreground text-sm">Nacitavanie...</div>
          }
        >
          <BannersLoader />
        </Suspense>
      </section>
    </>
  );
}
