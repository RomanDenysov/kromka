import { Suspense } from "react";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { SettingsConfigurationsClient } from "./_components/settings-configurations-client";

async function ConfigurationsLoader() {
  const [ordersEnabled, registrationEnabled, promoBanner] = await Promise.all([
    getSiteConfig("orders_enabled"),
    getSiteConfig("registration_enabled"),
    getSiteConfig("promo_banner"),
  ]);

  return (
    <SettingsConfigurationsClient
      initialValues={{
        orders_enabled: ordersEnabled,
        registration_enabled: registrationEnabled,
        promo_banner: promoBanner,
      }}
    />
  );
}

export default function SettingsConfigurationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Konfigurácie</h1>
        <p className="text-muted-foreground text-sm">
          Spravujte globálne nastavenia systému.
        </p>
      </div>
      <Suspense
        fallback={<div className="text-muted-foreground">Načítavanie...</div>}
      >
        <ConfigurationsLoader />
      </Suspense>
    </div>
  );
}
