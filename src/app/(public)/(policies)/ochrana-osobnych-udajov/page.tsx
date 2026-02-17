import type { Metadata } from "next";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Ochrana osobných údajov",
  description:
    "Zásady ochrany osobných údajov spoločnosti KROMKA s.r.o. v súlade s GDPR. Informácie o spracúvaní a ochrane vašich údajov.",
  canonicalUrl: getSiteUrl("/ochrana-osobnych-udajov"),
});

export default function OchranaOsobnychUdajovPage() {
  return (
    <PageWrapper className="text-balance">
      <AppBreadcrumbs
        items={[
          {
            label: "Ochrana osobných údajov",
            href: "/ochrana-osobnych-udajov",
          },
        ]}
      />
      <h1 className="font-bold text-3xl">Ochrana osobných údajov</h1>

      <article className="space-y-4" id="zakladne-informacie">
        <h2 className="font-semibold text-xl">1. Základné informácie</h2>
        <p className="font-normal text-base">
          1.1. Prevádzkovateľom osobných údajov podľa čl. 4 bod 7 nariadenia
          Európskeho parlamentu a Rady (EÚ) 2016/679 o ochrane fyzických osôb
          pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov
          (ďalej len &quot;GDPR&quot;) je KROMKA s.r.o., IČO: 46 670 068, so
          sídlom ul. 17. novembra 8288/106, Prešov 080 01 (ďalej len
          &quot;prevádzkovateľ&quot;).
        </p>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            1.2. Kontaktné údaje prevádzkovateľa:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <span className="font-semibold text-muted-foreground italic">
                Email:
              </span>{" "}
              kromka@kavejo.sk
            </li>
            <li>
              <span className="font-semibold text-muted-foreground italic">
                Adresa:
              </span>{" "}
              ul. 17. novembra 8288/106, Prešov 080 01
            </li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="rozsah-spracovania">
        <h2 className="font-semibold text-xl">
          2. Rozsah spracúvania osobných údajov
        </h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            2.1. Pred registráciou spracúvame:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Technické údaje o zariadení používateľa</li>
            <li>
              Identifikátor zariadenia pre účely poskytovania personalizovaných
              služieb
            </li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            2.2. Po registrácii spracúvame:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Meno a priezvisko</li>
            <li>E-mailovú adresu</li>
            <li>Telefónne číslo</li>
            <li>
              Pri prihlásení cez Google: meno, e-mail a profilový obrázok z
              Google účtu
            </li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">2.3. Platobné údaje:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              Platby sú realizované výlučne na predajnom mieste (v hotovosti
              alebo kartou cez platobný terminál)
            </li>
            <li>
              Prevádzkovateľ neuchováva ani nespracúva údaje o platobných
              kartách zákazníkov
            </li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="pravny-zaklad">
        <h2 className="font-semibold text-xl">3. Právny základ spracúvania</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            3.1. Osobné údaje spracúvame na základe nasledujúcich právnych
            základov podľa čl. 6 GDPR:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <span className="font-semibold">Plnenie zmluvy</span> (čl. 6 ods.
              1 písm. b) — spracovanie objednávok, správa používateľského účtu,
              komunikácia so zákazníkom
            </li>
            <li>
              <span className="font-semibold">Súhlas</span> (čl. 6 ods. 1 písm.
              a) — analytické cookies (PostHog), marketingová komunikácia
            </li>
            <li>
              <span className="font-semibold">Oprávnený záujem</span> (čl. 6
              ods. 1 písm. f) — zabezpečenie webovej stránky, predchádzanie
              podvodom, základná analýza návštevnosti
            </li>
            <li>
              <span className="font-semibold">Zákonná povinnosť</span> (čl. 6
              ods. 1 písm. c) — plnenie daňových a účtovných povinností
            </li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="ucel-spracovania">
        <h2 className="font-semibold text-xl">
          4. Účel spracovania osobných údajov
        </h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            4.1. Osobné údaje spracúvame na tieto účely:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Vytvorenie a správa používateľského účtu</li>
            <li>Poskytovanie personalizovaných služieb</li>
            <li>Spracovanie objednávok</li>
            <li>Komunikácia so zákazníkom</li>
            <li>Plnenie zákonných povinností</li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="doba-uchovavania">
        <h2 className="font-semibold text-xl">5. Doba uchovávania údajov</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            5.1. Osobné údaje spracúvame a uchovávame:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Po dobu používania účtu</li>
            <li>Po dobu nevyhnutnú na plnenie zákonných povinností</li>
            <li>Do odvolania súhlasu používateľom</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          5.2. Po uplynutí doby uchovávania osobných údajov prevádzkovateľ
          osobné údaje vymaže.
        </p>
      </article>

      <article className="space-y-4" id="prijemcovia">
        <h2 className="font-semibold text-xl">
          6. Príjemcovia a sprostredkovatelia
        </h2>
        <p className="font-normal text-base">
          6.1. K osobným údajom majú prístup len oprávnení zamestnanci
          prevádzkovateľa.
        </p>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            6.2. Na prevádzku služieb využívame nasledujúcich
            sprostredkovateľov:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <span className="font-semibold">Vercel Inc.</span> (USA) — hosting
              webovej stránky. Prenos údajov do USA je zabezpečený štandardnými
              zmluvnými doložkami EÚ (SCC).
            </li>
            <li>
              <span className="font-semibold">PostHog Inc.</span> — analytický
              nástroj. Dáta sú uložené v EÚ (eu.posthog.com). Aktivovaný len s
              výslovným súhlasom používateľa.
            </li>
            <li>
              <span className="font-semibold">Neon Inc.</span> — databázové
              služby. Dáta sú uložené v EÚ regióne.
            </li>
            <li>
              <span className="font-semibold">Google LLC</span> (USA) —
              autentifikácia cez Google OAuth. Prenos údajov do USA je
              zabezpečený štandardnými zmluvnými doložkami EÚ (SCC).
            </li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="prenos-udajov">
        <h2 className="font-semibold text-xl">7. Medzinárodný prenos údajov</h2>
        <p className="font-normal text-base">
          7.1. Niektorí z našich sprostredkovateľov (Vercel, Google) sídlia v
          USA. Prenos osobných údajov do tretích krajín je zabezpečený
          prostredníctvom štandardných zmluvných doložiek (SCC) schválených
          Európskou komisiou v súlade s čl. 46 ods. 2 písm. c) GDPR.
        </p>
        <p className="font-normal text-base">
          7.2. Dáta analytického nástroja PostHog a databázy Neon sú uložené
          výlučne v EÚ regióne.
        </p>
      </article>

      <article className="space-y-4" id="prava-osoby">
        <h2 className="font-semibold text-xl">8. Práva dotknutej osoby</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            8.1. Za podmienok stanovených v GDPR máte:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Právo na prístup k svojim osobným údajom</li>
            <li>Právo na opravu osobných údajov</li>
            <li>Právo na vymazanie osobných údajov</li>
            <li>Právo na obmedzenie spracúvania</li>
            <li>Právo na prenosnosť údajov</li>
            <li>Právo namietať proti spracúvaniu</li>
            <li>Právo odvolať súhlas so spracovaním osobných údajov</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          8.2. Ďalej máte právo podať sťažnosť na Úrade pre ochranu osobných
          údajov v prípade, že sa domnievate, že bolo porušené Vaše právo na
          ochranu osobných údajov.
        </p>
      </article>

      <article className="space-y-4" id="zabezpecenie">
        <h2 className="font-semibold text-xl">
          9. Zabezpečenie osobných údajov
        </h2>
        <p className="font-normal text-base">
          9.1. Prevádzkovateľ vyhlasuje, že prijal všetky primerané technické a
          organizačné opatrenia na zabezpečenie osobných údajov.
        </p>
        <p className="font-normal text-base">
          9.2. Prevádzkovateľ prijal technické opatrenia na zabezpečenie
          dátových úložísk a úložísk osobných údajov v písomnej podobe.
        </p>
      </article>

      <article className="space-y-4" id="zaverecne-ustanovenia">
        <h2 className="font-semibold text-xl">10. Záverečné ustanovenia</h2>
        <p className="font-normal text-base">
          10.1. Odoslaním registračného formulára potvrdzujete, že ste
          oboznámení s podmienkami ochrany osobných údajov a že ich v celom
          rozsahu prijímate.
        </p>
        <p className="font-normal text-base">
          10.2. Prevádzkovateľ je oprávnený tieto podmienky zmeniť. Novú verziu
          podmienok ochrany osobných údajov zverejní na svojich internetových
          stránkach.
        </p>
        <p className="mt-8 text-muted-foreground text-sm italic">
          Tieto podmienky ochrany osobných údajov sú platné a účinné od
          17.02.2026
        </p>
      </article>
    </PageWrapper>
  );
}
