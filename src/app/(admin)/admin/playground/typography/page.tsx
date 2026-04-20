import type { Metadata, Route } from "next";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { PlaygroundSubnav } from "../_components/playground-subnav";

export const metadata: Metadata = {
  title: "Typografia",
};

const TEXT_SCALE = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
] as const;

const WEIGHTS = [
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-extrabold",
] as const;

export default function PlaygroundTypographyPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/playground" as Route, label: "Playground" },
          { label: "Typografia" },
        ]}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 pb-16">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Typografia</h1>
          <p className="text-muted-foreground text-sm">
            Aktuálny font stack (Geist), mierka, váhy a sémantické farby textu.
            Komentáre v <span className="font-mono">globals.css</span> popisujú
            aj zámer značky (Outfit, váhy 400–800); v produkcii sa renderuje
            Geist cez <span className="font-mono">fonts.ts</span>.
          </p>
        </div>
        <PlaygroundSubnav />

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">
            Téma (light / dark)
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ThemeSwitch</CardTitle>
              <CardDescription>
                Overenie textových tokenov v tmavom režime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitch />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">Rodiny písma</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="font-sans text-base">
                <span className="text-muted-foreground text-sm">
                  font-sans —{" "}
                </span>
                Bežný text (Geist Sans cez CSS premennú).
              </p>
              <p className="font-mono text-sm">
                <span className="text-muted-foreground text-sm">
                  font-mono —{" "}
                </span>
                const answer = 42;
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">
            Mierka (Tailwind)
          </h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {TEXT_SCALE.map((cls) => (
                <div className="flex flex-wrap items-baseline gap-3" key={cls}>
                  <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs">
                    {cls}
                  </code>
                  <span className={cls}>Vzorový riadok textu</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">Váhy</h2>
          <Card>
            <CardContent className="space-y-2 pt-6">
              {WEIGHTS.map((w) => (
                <p className={`text-lg ${w}`} key={w}>
                  {w.replace("font-", "")} — Pekáreň Kromka
                </p>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">
            Sémantické farby textu
          </h2>
          <Card>
            <CardContent className="space-y-2 pt-6 text-base">
              <p className="text-foreground">text-foreground — hlavný text</p>
              <p className="text-muted-foreground">
                text-muted-foreground — popis, podnadpisy
              </p>
              <p className="text-brand">text-brand — značkový akcent</p>
              <p className="text-destructive">
                text-destructive — chyba / varovanie
              </p>
              <p>
                <a
                  className="text-primary underline underline-offset-4"
                  href="https://example.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  Odkaz (primárna farba + underline)
                </a>
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">
            Vzory z aplikácie
          </h2>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  Názov stránky
                </p>
                <p className="font-bold text-2xl">Globálne nastavenia</p>
              </div>
              <Separator />
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  Sekcia / karta
                </p>
                <h4 className="font-semibold text-sm">Kontaktné informácie</h4>
              </div>
              <Separator />
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  CardTitle (UI)
                </p>
                <div className="font-semibold leading-none">Nadpis karty</div>
                <div className="text-muted-foreground text-sm">
                  Popis pod nadpisom karty.
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  DialogTitle
                </p>
                <div className="font-semibold text-lg leading-none">
                  Modálny nadpis
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-1 font-medium text-muted-foreground text-xs">
                  Sekundárna navigácia
                </p>
                <nav className="flex gap-4 text-sm">
                  <span className="font-medium text-primary underline underline-offset-4">
                    Aktívna položka
                  </span>
                  <span className="text-primary/80">Ďalšia položka</span>
                </nav>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-lg tracking-tight">
            Editor / blog (ProseMirror)
          </h2>
          <p className="text-muted-foreground text-sm">
            Triedy z <span className="font-mono">globals.css</span> pre obsah
            článkov v editore.
          </p>
          <Card>
            <CardContent className="pt-6">
              <div className="ProseMirror max-w-none border-muted border-l-2 pl-4">
                <h2>Nadpis úrovne 2</h2>
                <p>Bežný odstavec v editore.</p>
                <h3>Nadpis úrovne 3</h3>
                <h4>Nadpis úrovne 4</h4>
                <p>
                  <strong>Tučný text</strong> a <em>kurzíva</em>.
                </p>
                <p>
                  <a
                    href="https://example.com"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Odkaz v článku
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
