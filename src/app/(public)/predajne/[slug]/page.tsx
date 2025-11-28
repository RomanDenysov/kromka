"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Clock, Mail, MapPin, Phone, StoreIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

const DAYS_MAP: Record<string, string> = {
  monday: "Pondelok",
  tuesday: "Utorok",
  wednesday: "Streda",
  thursday: "Štvrtok",
  friday: "Piatok",
  saturday: "Sobota",
  sunday: "Nedeľa",
};

// biome-ignore lint/suspicious/noExplicitAny: Ignore it for now
const formatTimeRange = (schedule: any) => {
  if (!schedule || schedule === "closed") {
    return "Zatvorené";
  }
  return `${schedule.start} - ${schedule.end}`;
};

export default function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const trpc = useTRPC();

  const { data: store, isLoading } = useQuery(
    trpc.public.stores.bySlug.queryOptions({ slug })
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!store) {
    notFound();
  }

  const { regularHours } = store.openingHours || {};

  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "Predajne", href: "/predajne" },
          { label: store.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Column - Image & Map would go here */}
        <div className="space-y-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
            {store.image?.url ? (
              <Image
                alt={store.name}
                className="object-cover"
                fill
                priority
                src={store.image.url}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <StoreIcon className="size-24 opacity-20" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-8">
          <div>
            <h1 className="font-bold text-4xl tracking-tight">{store.name}</h1>
            {store.description?.content?.[0]?.content?.[0]?.text && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {store.description.content[0].content[0].text}
              </p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <MapPin className="size-5 text-primary" />
                <h3>Adresa a kontakt</h3>
              </div>
              <div className="space-y-3 text-muted-foreground text-sm">
                {store.address && (
                  <p>
                    {[
                      store.address.street,
                      store.address.postalCode,
                      store.address.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4" />
                    <a
                      className="hover:text-primary"
                      href={`tel:${store.phone}`}
                    >
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <a
                      className="hover:text-primary"
                      href={`mailto:${store.email}`}
                    >
                      {store.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Clock className="size-5 text-primary" />
                <h3>Otváracie hodiny</h3>
              </div>
              <div className="space-y-2 text-sm">
                {regularHours &&
                  [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => {
                    // @ts-expect-error - indexing with string day
                    const schedule = regularHours[day];
                    const isToday =
                      format(new Date(), "EEEE", {
                        locale: sk,
                      }).toLowerCase() === day;

                    return (
                      <div
                        className={`flex justify-between ${
                          isToday
                            ? "font-bold text-primary"
                            : "text-muted-foreground"
                        }`}
                        key={day}
                      >
                        <span className="capitalize">
                          {DAYS_MAP[day] || day}
                        </span>
                        <span>{formatTimeRange(schedule)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
