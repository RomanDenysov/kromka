"use client";

import {
  CheckCircle2Icon,
  ImageIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activateHeroBannerAction,
  deactivateHeroBannerAction,
  deleteHeroBannerAction,
} from "@/features/hero-banners/api/actions";
import type { HeroBannerRow } from "@/features/hero-banners/api/queries";

interface Props {
  banners: HeroBannerRow[];
}

function BannerCard({ banner }: { banner: HeroBannerRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      const result = banner.isActive
        ? await deactivateHeroBannerAction(banner.id)
        : await activateHeroBannerAction(banner.id);

      if (result.success) {
        toast.success(
          banner.isActive ? "Banner deaktivovany" : "Banner aktivovany"
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Nastala chyba");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteHeroBannerAction(banner.id);
      if (result.success) {
        toast.success("Banner bol vymazany");
        router.refresh();
      } else if (result.error === "CANNOT_DELETE_ACTIVE") {
        toast.error("Nie je mozne vymazat aktivny banner");
      } else {
        toast.error("Nastala chyba pri mazani");
      }
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-[21/9] w-full bg-muted">
        {banner.image?.url ? (
          <Image
            alt={banner.name}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={banner.image.url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        {banner.isActive && (
          <Badge className="absolute top-2 left-2" variant="default">
            Aktivny
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{banner.name}</p>
          <p className="truncate text-muted-foreground text-xs">
            {banner.ctaLabel ?? "Bez CTA"} &rarr; {banner.ctaHref ?? "-"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            disabled={isPending}
            onClick={handleActivate}
            size="icon-sm"
            title={banner.isActive ? "Deaktivovat" : "Aktivovat"}
            variant={banner.isActive ? "default" : "outline"}
          >
            <CheckCircle2Icon className="size-3.5" />
          </Button>
          <Button asChild size="icon-sm" variant="outline">
            <Link href={`/admin/hero-banners/${banner.id}` as Route}>
              <PencilIcon className="size-3.5" />
            </Link>
          </Button>
          <Button
            disabled={isPending || banner.isActive}
            onClick={handleDelete}
            size="icon-sm"
            variant="outline"
          >
            <TrashIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HeroBannersList({ banners }: Props) {
  if (banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
        <ImageIcon className="size-10" />
        <p className="text-sm">Zatial ziadne bannery</p>
        <Button asChild size="sm">
          <Link href={"/admin/hero-banners/new" as Route}>
            Vytvorit prvy banner
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid @lg/page:grid-cols-2 gap-4">
      {banners.map((banner) => (
        <BannerCard banner={banner} key={banner.id} />
      ))}
    </div>
  );
}
