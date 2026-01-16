import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { PageWrapper } from "@/components/shared/container";
import { StoreNavigationButton } from "@/components/store-navigation-button";
import { db } from "@/db";
import type { DaySchedule, StoreSchedule } from "@/db/types";
import { createMetadata } from "@/lib/metadata";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";

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

async function getStoreBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag("stores", `store-${slug}`);
  return await db.query.stores.findFirst({
    where: (s, { eq, and }) => and(eq(s.slug, slug), eq(s.isActive, true)),
    with: {
      image: true,
    },
  });
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return {};
  }

  const fullAddress = [store.address?.street, store.address?.city]
    .filter(Boolean)
    .join(", ");

  const description = store.description?.content?.[0]?.content?.[0]?.text
    ? store.description.content[0].content[0].text
    : `Predajňa Pekáreň Kromka na adrese ${fullAddress}. Čerstvé pečivo, otváracie hodiny a kontakt.`;

  return createMetadata({
    title: store.name,
    description,
    canonicalUrl: getSiteUrl(`/predajne/${store.slug}`),
    image: store.image?.url ?? undefined,
  });
}

async function StorePageContent({
  store,
}: {
  store: NonNullable<Awaited<ReturnType<typeof getStoreBySlug>>>;
}) {
  const { regularHours } = store.openingHours || {};
  const todayKey = format(new Date(), "EEEE", { locale: sk }).toLowerCase();
  const storeIsOpen = isStoreOpen(
    regularHours as StoreSchedule["regularHours"]
  );

  const fullAddress = [
    store.address?.street,
    store.address?.postalCode,
    store.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const storeDescription = store.description?.content?.[0]?.content?.[0]?.text;

  const localBusinessSchema = getLocalBusinessSchema({
    name: store.name,
    description: storeDescription,
    slug: store.slug,
    address: store.address,
    phone: store.phone,
    email: store.email,
    latitude: store.latitude,
    longitude: store.longitude,
    openingHours: store.openingHours as StoreSchedule | null | undefined,
    image: store.image?.url,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Predajne", href: "/predajne" },
    { name: store.name },
  ]);

  return (
    <PageWrapper>
      <JsonLd data={[localBusinessSchema, breadcrumbSchema]} />
      <div className="space-y-12 py-8">
        {/* Back Link */}
        <Link
          className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/predajne"
        >
          <ArrowLeft className="size-4" />
          Všetky predajne
        </Link>

        {/* Header Section - Minimal */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full ${storeIsOpen ? "bg-green-500" : "bg-neutral-400"}`}
              />
              <span className="text-muted-foreground text-sm">
                {storeIsOpen ? "Práve otvorené" : "Zatvorené"}
              </span>
            </div>
          </div>

          <h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
            {store.name}
          </h1>

          {store.description?.content?.[0]?.content?.[0]?.text && (
            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
              {store.description.content[0].content[0].text}
            </p>
          )}
        </section>

        {/* Info Sections - Clean and Minimal */}
        <section className="space-y-8">
          {/* Opening Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-xl tracking-tight">
                Otváracie hodiny
              </h2>
            </div>
            <div className="space-y-1 border-border border-l-2 pl-4">
              {regularHours &&
                DAYS_ORDER.map((day) => {
                  const schedule =
                    regularHours[day as keyof typeof regularHours];
                  const isToday = todayKey === day;

                  return (
                    <div
                      className={`flex items-center justify-between py-1.5 ${
                        isToday ? "font-medium" : "text-muted-foreground"
                      }`}
                      key={day}
                    >
                      <span>{DAYS_MAP[day]}</span>
                      <span className={isToday ? "" : "tabular-nums"}>
                        {formatTimeRange(schedule)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-xl tracking-tight">Adresa</h2>
            </div>
            <div className="space-y-2 border-border border-l-2 pl-4">
              <p className="text-lg">{fullAddress}</p>
              {fullAddress && (
                <StoreNavigationButton
                  address={fullAddress}
                  latitude={store.latitude}
                  longitude={store.longitude}
                  variant="link"
                />
              )}
            </div>
          </div>

          {/* Contact */}
          {(store.phone || store.email) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-xl tracking-tight">
                  Kontakt
                </h2>
              </div>
              <div className="space-y-2 border-border border-l-2 pl-4">
                {store.phone && (
                  <a
                    className="block text-lg transition-colors hover:text-primary"
                    href={`tel:${store.phone}`}
                  >
                    {store.phone}
                  </a>
                )}
                {store.email && (
                  <a
                    className="block transition-colors hover:text-primary"
                    href={`mailto:${store.email}`}
                  >
                    {store.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Navigation Button */}
          {fullAddress && (
            <div className="pt-4">
              <StoreNavigationButton
                address={fullAddress}
                latitude={store.latitude}
                longitude={store.longitude}
                variant="button"
              />
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}

async function StorePageWrapper({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  return <StorePageContent store={store} />;
}

export default function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<PageWrapper>Loading...</PageWrapper>}>
      <StorePageWrapper params={params} />
    </Suspense>
  );
}
