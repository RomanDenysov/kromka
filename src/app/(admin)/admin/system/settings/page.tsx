import { SettingsRow } from "@/components/settings/settings-row";

export default function SettingsPage() {
  // Since schema only supports boolean, we'll show read-only system info
  const systemInfo = [
    {
      icon: "InfoIcon",
      title: "Verzia aplikácie",
      description: "Aktuálna verzia systému",
      value: process.env.NEXT_PUBLIC_APP_VERSION ?? "Neznáma",
    },
    {
      icon: "ServerIcon",
      title: "Prostredie",
      description: "Aktuálne prostredie aplikácie",
      value: process.env.NODE_ENV === "production" ? "Produkcia" : "Vývoj",
    },
    {
      icon: "DatabaseIcon",
      title: "Databáza",
      description: "Stav databázového pripojenia",
      value: "Pripojené",
    },
    {
      icon: "GlobeIcon",
      title: "Doména",
      description: "Hlavná doména aplikácie",
      value: process.env.NEXT_PUBLIC_SITE_URL ?? "Neznáma",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Globálne nastavenia</h1>
        <p className="text-muted-foreground text-sm">
          Prehľad systémových informácií a základných nastavení.
        </p>
      </div>
      <div className="space-y-3">
        {systemInfo.map((info) => (
          <SettingsRow
            control={
              <div className="font-medium text-muted-foreground text-sm">
                {info.value}
              </div>
            }
            description={info.description}
            icon={info.icon}
            key={info.title}
            title={info.title}
          />
        ))}
      </div>
    </div>
  );
}
