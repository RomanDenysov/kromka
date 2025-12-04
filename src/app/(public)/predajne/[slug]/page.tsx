import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import type { DaySchedule, StoreSchedule } from "@/db/types";
import { getAuth } from "@/lib/auth/session";

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAYS_MAP: Record<string, string> = {
  monday: "Pondelok",
  tuesday: "Utorok",
  wednesday: "Streda",
  thursday: "Štvrtok",
  friday: "Piatok",
  saturday: "Sobota",
  sunday: "Nedeľa",
};

const formatTimeRange = (schedule: DaySchedule) => {
  if (!schedule || schedule === "closed") {
    return "Zatvorené";
  }
  return `${schedule.start} – ${schedule.end}`;
};

const isStoreOpen = (regularHours: StoreSchedule["regularHours"]) => {
  if (!regularHours) {
    return false;
  }
  const today = format(new Date(), "EEEE", { locale: sk }).toLowerCase();
  const schedule = regularHours[today as keyof typeof regularHours];
  if (!schedule || schedule === "closed") {
    return false;
  }

  const now = new Date();
  const [startH, startM] = schedule.start.split(":").map(Number);
  const [endH, endM] = schedule.end.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await db.query.stores.findFirst({
    where: (s, { eq, and }) => and(eq(s.slug, slug), eq(s.isActive, true)),
    with: {
      image: true,
    },
  });

  const { store: userStore } = await getAuth();

  if (!store) {
    notFound();
  }

  const { regularHours } = store.openingHours || {};
  const todayKey = format(new Date(), "EEEE", { locale: sk }).toLowerCase();
  const storeIsOpen = isStoreOpen(
    regularHours as StoreSchedule["regularHours"]
  );
  const isSelected = userStore?.id === store.id;

  const fullAddress = [
    store.address?.street,
    store.address?.postalCode,
    store.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const googleMapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <PageWrapper>
      {/* Back Link */}
      <Link
        className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
        href="/predajne"
      >
        <ArrowLeft className="size-4" />
        Všetky predajne
      </Link>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900">
        {/* Background Image */}
        {store.image?.url ? (
          <>
            <Image
              alt={store.name}
              className="absolute inset-0 object-cover opacity-50"
              fill
              priority
              src={store.image.url}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-neutral-900/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
        )}

        <div className="relative px-6 py-12 md:px-10 md:py-16 lg:py-20">
          {/* Status Badge */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`size-2.5 rounded-full ${storeIsOpen ? "bg-green-400" : "bg-neutral-500"}`}
              />
              <span className="font-medium text-sm text-white">
                {storeIsOpen ? "Práve otvorené" : "Zatvorené"}
              </span>
            </div>
            {isSelected && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-white text-xs backdrop-blur-sm">
                Vaša predajňa
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="max-w-2xl font-bold text-4xl text-white md:text-5xl lg:text-6xl">
            {store.name}
          </h1>

          {/* Description */}
          {store.description?.content?.[0]?.content?.[0]?.text && (
            <p className="mt-4 max-w-xl text-lg text-white/70 leading-relaxed">
              {store.description.content[0].content[0].text}
            </p>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            {googleMapsUrl && (
              <Button
                asChild
                className="rounded-full"
                size="lg"
                variant="outline"
              >
                <a
                  href={googleMapsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation className="size-4" />
                  Navigovať
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Info Grid - Bento Style */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Opening Hours Card */}
        <div className="rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
          <div className="mb-5 flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span className="font-medium text-sm uppercase tracking-wider">
              Otváracie hodiny
            </span>
          </div>

          <div className="space-y-2">
            {regularHours &&
              DAYS_ORDER.map((day) => {
                const schedule = regularHours[day as keyof typeof regularHours];
                const isToday = todayKey === day;

                return (
                  <div
                    className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      isToday
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "text-muted-foreground"
                    }`}
                    key={day}
                  >
                    <span className="font-medium">{DAYS_MAP[day]}</span>
                    <span className={isToday ? "" : "tabular-nums"}>
                      {formatTimeRange(schedule)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Contact & Address Card */}
        <div className="flex flex-col gap-4">
          {/* Address */}
          <div className="flex-1 rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span className="font-medium text-sm uppercase tracking-wider">
                Adresa
              </span>
            </div>

            <p className="font-medium text-lg">{fullAddress}</p>

            {googleMapsUrl && (
              <a
                className="mt-3 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={googleMapsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Otvoriť v Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          {/* Contact */}
          {(store.phone || store.email) && (
            <div className="rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
              <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                <span className="font-medium text-sm uppercase tracking-wider">
                  Kontakt
                </span>
              </div>

              <div className="space-y-3">
                {store.phone && (
                  <a
                    className="flex items-center gap-3 font-medium text-lg transition-colors hover:text-primary"
                    href={`tel:${store.phone}`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <Phone className="size-4" />
                    </div>
                    {store.phone}
                  </a>
                )}
                {store.email && (
                  <a
                    className="flex items-center gap-3 font-medium transition-colors hover:text-primary"
                    href={`mailto:${store.email}`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <Mail className="size-4" />
                    </div>
                    {store.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map Placeholder or Additional Section */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <MapPin className="mb-4 size-8 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Interaktívna mapa</h3>
          <p className="mt-1 max-w-md text-muted-foreground text-sm">
            Tu môže byť vložená mapa s presnou polohou predajne
          </p>
          {googleMapsUrl && (
            <Button asChild className="mt-4 rounded-full" variant="outline">
              <a href={googleMapsUrl} rel="noopener noreferrer" target="_blank">
                Zobraziť na Google Maps
              </a>
            </Button>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
