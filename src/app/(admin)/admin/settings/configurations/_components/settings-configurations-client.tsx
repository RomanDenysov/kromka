"use client";

import { MegaphoneIcon, ShoppingCartIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SettingsRow } from "@/components/settings/settings-row";
import { Switch } from "@/components/ui/switch";
import { updateSiteConfig } from "@/lib/site-config/actions";

type SettingsConfigurationsClientProps = {
  initialValues: {
    orders_enabled: boolean;
    registration_enabled: boolean;
    promo_banner: boolean;
  };
};

const SETTINGS_CONFIG = [
  {
    key: "orders_enabled" as const,
    icon: ShoppingCartIcon,
    title: "Objednávky povolené",
    description: "Umožňuje používateľom vytvárať objednávky cez eshop.",
  },
  {
    key: "registration_enabled" as const,
    icon: UserPlusIcon,
    title: "Registrácia povolená",
    description: "Umožňuje novým používateľom sa registrovať.",
  },
  {
    key: "promo_banner" as const,
    icon: MegaphoneIcon,
    title: "Propagačný banner",
    description: "Zobrazuje propagačný banner na stránke.",
  },
] as const;

export function SettingsConfigurationsClient({
  initialValues,
}: SettingsConfigurationsClientProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: keyof typeof initialValues, newValue: boolean) => {
    const previousValue = values[key];

    // Optimistic update
    setValues((prev) => ({ ...prev, [key]: newValue }));

    startTransition(async () => {
      const result = await updateSiteConfig(key, newValue);

      if (result.success) {
        toast.success("Nastavenie bolo aktualizované");
        router.refresh();
      } else {
        // Revert optimistic update on error
        setValues((prev) => ({ ...prev, [key]: previousValue }));
        toast.error(
          result.error ?? "Nastala chyba pri aktualizácii nastavenia"
        );
      }
    });
  };

  return (
    <div className="space-y-3">
      {SETTINGS_CONFIG.map((config) => (
        <SettingsRow
          control={
            <Switch
              checked={values[config.key]}
              disabled={isPending}
              onCheckedChange={(checked) => handleToggle(config.key, checked)}
            />
          }
          description={config.description}
          icon={config.icon}
          key={config.key}
          title={config.title}
        />
      ))}
    </div>
  );
}
