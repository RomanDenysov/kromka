"use client";

import { useCallback, useTransition } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { providerLogin } from "../actions/provider-login";

const PROVIDERS = ["google", "apple", "facebook"] as const;

type Provider = (typeof PROVIDERS)[number];

const providerItems = PROVIDERS.map((provider) => ({
  id: provider,
  name: provider.charAt(0).toUpperCase() + provider.slice(1),
  icon: Icons[provider],
}));

export function ProvidersForm({ callbackURL }: { callbackURL: string }) {
  const [isPending, startTransition] = useTransition();

  const handleProviderLogin = useCallback(
    async (provider: Provider) =>
      startTransition(async () => {
        await providerLogin(provider, callbackURL);
      }),
    [callbackURL]
  );

  return (
    <div className="flex flex-col gap-3">
      {providerItems.map((provider) => (
        <Button
          className="w-full"
          disabled={isPending}
          key={provider.id}
          onClick={() => handleProviderLogin(provider.id)}
          size="xs"
          type="button"
          variant="outline"
        >
          {isPending ? <Spinner /> : <provider.icon />}
          {isPending ? "Prihlásenie..." : `Prihlásiť sa cez ${provider.name}`}
        </Button>
      ))}
    </div>
  );
}
