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
        <div className="font-normal text-base">
          <p className="font-normal text-base">3.2. Nepoužívame:</p>
          <ul className="list-disc space-y-1">
            <li>Cookies tretích strán</li>
            <li>Marketingové cookies</li>
            <li>Analytické cookies</li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="sprava-nastaveni">
        <h2 className="font-semibold text-xl">4. Správa nastavení cookies</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            4.1. Prehliadače obvykle umožňujú:
          </p>
          <ul className="list-disc space-y-1">
            <li>Zobraziť existujúce cookies</li>
            <li>Povoliť alebo zakázať cookies</li>
            <li>Vymazať existujúce cookies</li>
            <li>Nastaviť pravidlá pre jednotlivé webové stránky</li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            4.2. Návod na správu cookies v jednotlivých prehliadačoch:
          </p>
          <ul className="list-disc space-y-1">
            <li>Chrome: Nastavenia → Súkromie a zabezpečenie → Cookies</li>
            <li>Firefox: Nastavenia → Súkromie a zabezpečenie → Cookies</li>
            <li>Safari: Predvoľby → Súkromie → Cookies</li>
            <li>Edge: Nastavenia → Cookies a povolenia stránok</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          4.3. Upozorňujeme, že obmedzenie používania cookies môže ovplyvniť
          funkcionalitu našej stránky.
        </p>
      </article>

      <article className="space-y-4" id="zmeny-cookies">
        <h2 className="font-semibold text-xl">5. Zmeny v používaní cookies</h2>
        <p className="font-normal text-base">
          5.1. Vyhradzujeme si právo kedykoľvek upraviť a doplniť túto politiku
          cookies. Zmeny budú zverejnené na tejto stránke.
        </p>
        <p className="font-normal text-base">
          5.2. V prípade zavedenia nových typov cookies budeme o tom
          používateľov vopred informovať a vyžiadame si ich súhlas, ak to
          vyžaduje zákon.
        </p>
      </article>

      <article className="space-y-4" id="kontaktne-udaje">
        <h2 className="font-semibold text-xl">6. Kontaktné údaje</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            6.1. V prípade otázok ohľadom používania cookies nás môžete
            kontaktovať na:
          </p>
          <ul className="list-disc space-y-1">
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
          1.12.2024
        </p>
      </article>
    </PageWrapper>
  );
}
