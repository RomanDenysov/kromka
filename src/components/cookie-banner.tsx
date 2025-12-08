// components/cookie-banner.tsx
"use client";

import { CookieIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConsent } from "@/hooks/use-consent";
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const { consentGiven, acceptAll, acceptNecessary } = useConsent();

  const handleAnonymousSingIn = useCallback(async () => {
    await signIn.anonymous({
      fetchOptions: {
        onSuccess: () => {
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.log("Anonymous sign in successful");
        },
        onError: (error) => {
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.error("Anonymous sign in failed:", error);
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!consentGiven) {
      // biome-ignore lint/style/noMagicNumbers: we need to use magic numbers for the timeout
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [consentGiven]);

  if (consentGiven) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 transition-all duration-300",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <Card className="max-w-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CookieIcon className="size-5" />
            Používame cookies
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground text-sm">
          <p>
            Používame nevyhnutné cookies pre fungovanie e-shopu. S vaším
            súhlasom použijeme aj analytické cookies.
          </p>
          <Link
            className="mt-2 inline-block text-primary text-xs hover:underline"
            href="/pouzivanie-cookies"
          >
            Viac informácií
          </Link>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleAnonymousSingIn();
              acceptNecessary();
            }}
            size="sm"
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            type="button"
            variant="outline"
          >
            Len nevyhnutné
          </Button>
          <Button
            className="flex-1"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleAnonymousSingIn();
              acceptAll();
            }}
            size="sm"
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            type="button"
          >
            Prijať všetky
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
