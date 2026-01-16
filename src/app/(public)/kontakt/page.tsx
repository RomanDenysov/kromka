import { Facebook, Instagram, MailIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";
import { cn, getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Kontakt",
  description:
    "Máte otázky? Kontaktujte nás emailom na kromka@kavejo.sk alebo telefonicky. Sledujte nás na Instagrame a Facebooku.",
  canonicalUrl: getSiteUrl("/kontakt"),
});

export default function KontaktPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Kontakt" }]} />

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl md:text-4xl">Kontakt</h1>
          <p className="text-lg text-muted-foreground">
            Máte otázky? Radi vám pomôžeme. Kontaktujte nás prostredníctvom
            emailu, telefónu alebo vyplňte formulár pre podporu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktné údaje</CardTitle>
              <CardDescription>Napíšte nám alebo nám zavolajte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  href="mailto:kromka@kavejo.sk"
                >
                  <MailIcon className="size-5" />
                  <span className="text-sm">kromka@kavejo.sk</span>
                </Link>
              </div>
              <div>
                <Link
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  href="tel:+421912345678"
                >
                  <PhoneIcon className="size-5" />
                  <span className="text-sm">+421 912 345 678</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Sledujte nás</CardTitle>
              <CardDescription>
                Buďte v kontakte s nami na sociálnych sieťach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start"
                )}
                href="https://www.instagram.com/pekaren.kromka"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram className="size-4" />
                Instagram
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start"
                )}
                href="https://www.facebook.com/pekaren.kromka"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook className="size-4" />
                Facebook
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-start"
                )}
                href="https://zkromky.substack.com?utm_source=navbar&utm_medium=web"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icons.substack />
                Substack
              </Link>
            </CardContent>
          </Card>

          {/* Support Form Link */}
          <Card>
            <CardHeader>
              <CardTitle>Potrebujete pomoc?</CardTitle>
              <CardDescription>
                Vyplňte formulár a my sa vám ozveme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
                href="/kontakt/podpora"
              >
                Kontaktný formulár
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
