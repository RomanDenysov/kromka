import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export default function PouzivanieCookiesPage() {
  return (
    <PageWrapper className="text-balance">
      <AppBreadcrumbs
        items={[{ label: "Používanie cookies", href: "/pouzivanie-cookies" }]}
      />
      <h1 className="font-bold text-3xl">Zásady používania súborov cookies</h1>

      <article className="space-y-4" id="co-su-cookies">
        <h2 className="font-semibold text-xl">1. Čo sú súbory cookies</h2>
        <p className="font-normal text-base">
          1.1. Súbory cookies sú malé textové súbory, ktoré môžu byť do
          prehliadača odosielané pri návšteve webových stránok a ukladané do
          vášho zariadenia (počítača alebo do iného zariadenia s prístupom na
          internet, ako napr. smartphone alebo tablet).
        </p>
        <p className="font-normal text-base">
          1.2. Súbory cookies sa ukladajú do priečinka pre súbory vášho
          prehliadača. Cookies obvykle obsahujú názov webovej stránky, z ktorej
          pochádzajú, platnosť a hodnotu.
        </p>
      </article>

      <article className="space-y-4" id="preco-pouzivame">
        <h2 className="font-semibold text-xl">2. Prečo používame cookies</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            2.1. Naša webová stránka používa súbory cookies na nasledujúce
            účely:
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium">a) Nevyhnutné cookies:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Umožňujú základné funkcie stránky</li>
                <li>Zabezpečujú správne fungovanie e-shopu</li>
                <li>Umožňujú prihlásenie a autentifikáciu používateľa</li>
                <li>Uchovávajú obsah košíka</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">b) Funkčné cookies:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Pamätajú si vaše preferencie</li>
                <li>Umožňujú personalizáciu obsahu</li>
                <li>Zlepšujú používateľský komfort</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">
                c) Analytické cookies (s vaším súhlasom):
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  Pomáhajú nám pochopiť, ako používatelia používajú stránku
                </li>
                <li>Umožňujú analýzu návštevnosti a správania</li>
                <li>Pomáhajú zlepšovať kvalitu našich služieb</li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <article className="space-y-4" id="typy-cookies">
        <h2 className="font-semibold text-xl">
          3. Typy cookies, ktoré používame
        </h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            3.1. Z hľadiska trvanlivosti používame:
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium">a) Krátkodobé (session) cookies:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Sú dočasné</li>
                <li>
                  Zostávajú uložené vo vašom prehliadači len do jeho zatvorenia
                </li>
                <li>Umožňujú potrebnú funkcionalitu počas prehliadania</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">b) Dlhodobé (persistent) cookies:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Zostávajú uložené dlhšie</li>
                <li>Zlepšujú používateľský komfort</li>
                <li>Pamätajú si vaše nastavenia pre budúce návštevy</li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <article className="space-y-4" id="analyticke-nastroje">
        <h2 className="font-semibold text-xl">4. Analytické nástroje</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            4.1. Na analýzu návštevnosti používame nasledujúce nástroje:
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-medium">a) Vercel Analytics:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Základná analýza návštevnosti a výkonu stránky</li>
                <li>Nepoužíva cookies — funguje bez vášho súhlasu</li>
                <li>Nezhromažďuje osobné údaje</li>
                <li>
                  Poskytovateľ: Vercel Inc., USA (v súlade so štandardnými
                  zmluvnými doložkami EÚ)
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium">b) PostHog (len s vaším súhlasom):</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Podrobná analýza správania používateľov</li>
                <li>Pomáha nám zlepšovať používateľský zážitok</li>
                <li>Používa cookies — vyžaduje váš súhlas</li>
                <li>Dáta sú uložené v EÚ (eu.posthog.com) v súlade s GDPR</li>
                <li>
                  Viac informácií:{" "}
                  <a
                    className="text-primary underline"
                    href="https://posthog.com/privacy"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    PostHog Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="font-normal text-base">
          4.2. Analytické cookies od PostHog sú aktivované len po vašom
          výslovnom súhlase. Svoj súhlas môžete kedykoľvek odvolať v
          nastaveniach cookies.
        </p>
      </article>

      <article className="space-y-4" id="sprava-nastaveni">
        <h2 className="font-semibold text-xl">5. Správa nastavení cookies</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            5.1. Váš súhlas s analytickými cookies môžete spravovať:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Prostredníctvom banneru pri prvej návšteve stránky</li>
            <li>Kedykoľvek v nastaveniach cookies v päte stránky</li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            5.2. Prehliadače tiež umožňujú:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Zobraziť existujúce cookies</li>
            <li>Povoliť alebo zakázať cookies</li>
            <li>Vymazať existujúce cookies</li>
            <li>Nastaviť pravidlá pre jednotlivé webové stránky</li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            5.3. Návod na správu cookies v jednotlivých prehliadačoch:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Chrome: Nastavenia → Súkromie a zabezpečenie → Cookies</li>
            <li>Firefox: Nastavenia → Súkromie a zabezpečenie → Cookies</li>
            <li>Safari: Predvoľby → Súkromie → Cookies</li>
            <li>Edge: Nastavenia → Cookies a povolenia stránok</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          5.4. Upozorňujeme, že obmedzenie používania cookies môže ovplyvniť
          funkcionalitu našej stránky.
        </p>
      </article>

      <article className="space-y-4" id="zmeny-cookies">
        <h2 className="font-semibold text-xl">6. Zmeny v používaní cookies</h2>
        <p className="font-normal text-base">
          6.1. Vyhradzujeme si právo kedykoľvek upraviť a doplniť túto politiku
          cookies. Zmeny budú zverejnené na tejto stránke.
        </p>
        <p className="font-normal text-base">
          6.2. V prípade zavedenia nových typov cookies budeme o tom
          používateľov vopred informovať a vyžiadame si ich súhlas, ak to
          vyžaduje zákon.
        </p>
      </article>

      <article className="space-y-4" id="kontaktne-udaje">
        <h2 className="font-semibold text-xl">7. Kontaktné údaje</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            7.1. V prípade otázok ohľadom používania cookies nás môžete
            kontaktovať na:
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
        <p className="mt-8 text-muted-foreground text-sm italic">
          Tieto zásady používania súborov cookies sú platné a účinné od
          5.12.2025
        </p>
      </article>
    </PageWrapper>
  );
}
