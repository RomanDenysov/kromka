import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export default function ObchodnePodmienkyPage() {
  return (
    <PageWrapper className="text-balance">
      <AppBreadcrumbs
        items={[
          {
            label: "Obchodné podmienky",
            href: "/obchodne-podmienky",
          },
        ]}
      />
      <h1 className="font-bold text-3xl">Obchodné podmienky</h1>

      <article className="space-y-4" id="zakladne-ustanovenia">
        <h2 className="font-semibold text-xl">1. Základné ustanovenia</h2>
        <p className="font-normal text-base">
          1.1. Tieto obchodné podmienky upravujú vzťahy medzi zmluvnými stranami
          kúpnej zmluvy, kedy na jednej strane je spoločnosť KROMKA s.r.o., IČO:
          46 670 068, so sídlom ul. 17. novembra 8288/106, Prešov 080 01,
          zapísaná v Obchodnom registri Okresného súdu Prešov, Oddiel: Sro,
          Vložka číslo: 26041/P (ďalej len "predávajúci") a na druhej strane je
          zákazník (ďalej len "kupujúci").
        </p>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            1.2. Kontaktné údaje predávajúceho:
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
        <p className="font-normal text-base">
          1.3. Tieto obchodné podmienky sú neoddeliteľnou súčasťou kúpnej
          zmluvy. Odchylné dojednania v kúpnej zmluve majú prednosť pred
          ustanoveniami týchto obchodných podmienok.
        </p>
      </article>

      <article className="space-y-4" id="pouzivatelsky-ucet">
        <h2 className="font-semibold text-xl">2. Používateľský účet</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            2.1. Prístup k používateľskému účtu je zabezpečený prostredníctvom:
          </p>
          <ul className="list-disc space-y-1">
            <li>
              Magic-link prihlásenia (jednorázový prihlasovací odkaz zaslaný na
              email)
            </li>
            <li>Prihlásenia cez Google účet</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          2.2. Kupujúci je povinný zachovávať mlčanlivosť ohľadom informácií
          potrebných na prístup do jeho používateľského účtu.
        </p>
        <p className="font-normal text-base">
          2.3. Kupujúci môže požiadať o zrušenie svojho používateľského účtu
          emailom na kromka@kavejo.sk. Predávajúci sa zaväzuje spracovať túto
          žiadosť v súlade s platnými právnymi predpismi o ochrane osobných
          údajov.
        </p>
        <p className="font-normal text-base">
          2.4. Predávajúci môže zrušiť používateľský účet v prípade, keď
          kupujúci poruší svoje povinnosti z kúpnej zmluvy alebo týchto
          obchodných podmienok.
        </p>
      </article>

      <article className="space-y-4" id="prava-povinnosti">
        <h2 className="font-semibold text-xl">
          3. Práva a povinnosti používateľa
        </h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">3.1. Používateľ sa zaväzuje:</p>
          <ul className="list-disc space-y-1">
            <li>Používať webovú stránku v súlade s právnymi predpismi</li>
            <li>Nezasahovať do technického obsahu stránky</li>
            <li>Neuvádzať nepravdivé, zavádzajúce alebo urážlivé informácie</li>
            <li>Nepoužívať automatizované systémy na prístup k stránke</li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">3.2. Komentáre a hodnotenia:</p>
          <ul className="list-disc space-y-1">
            <li>
              Používateľ môže pridávať komentáre a označovať obsah ako "Páči sa
              mi"
            </li>
            <li>
              Komentáre musia byť vecné a nesmú obsahovať urážlivý, nezákonný
              alebo nevhodný obsah
            </li>
            <li>
              Predávajúci si vyhradzuje právo odstrániť nevhodné komentáre
            </li>
          </ul>
        </div>
        <div className="font-normal text-base">
          <p className="font-normal text-base">3.3. Autorské práva:</p>
          <ul className="list-disc space-y-1">
            <li>
              Všetok obsah na webovej stránke (texty, fotografie, logá) je
              chránený autorským právom
            </li>
            <li>Používateľ môže obsah používať len pre osobnú potrebu</li>
            <li>
              Akékoľvek komerčné využitie obsahu vyžaduje písomný súhlas
              predávajúceho
            </li>
          </ul>
        </div>
      </article>

      <article className="space-y-4" id="platobne-podmienky">
        <h2 className="font-semibold text-xl">4. Platobné podmienky</h2>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            4.1. Cenu tovaru a prípadné náklady spojené s dodaním tovaru môže
            kupujúci uhradiť nasledovnými spôsobmi:
          </p>
          <ul className="list-disc space-y-1">
            <li>Platba kartou online prostredníctvom služby Stripe</li>
            <li>Platba v hotovosti pri osobnom odbere</li>
            <li>Platba kartou pri osobnom odbere</li>
          </ul>
        </div>
        <p className="font-normal text-base">
          4.2. V prípade platby prostredníctvom platobnej brány Stripe postupuje
          kupujúci podľa pokynov príslušného poskytovateľa elektronických
          platieb.
        </p>
        <p className="font-normal text-base">
          4.3. Predávajúci vystaví kupujúcemu daňový doklad - faktúru. Daňový
          doklad je odoslaný na elektronickú adresu kupujúceho.
        </p>
      </article>

      <article className="space-y-4" id="zaverecne-ustanovenia">
        <h2 className="font-semibold text-xl">5. Záverečné ustanovenia</h2>
        <p className="font-normal text-base">
          5.1. Všetky právne vzťahy vznikajúce na základe alebo v súvislosti s
          týmito obchodnými podmienkami sa riadia právnym poriadkom Slovenskej
          republiky.
        </p>
        <p className="font-normal text-base">
          5.2. V prípade sporu medzi predávajúcim a kupujúcim môže kupujúci
          využiť možnosť mimosúdneho riešenia sporu. V takom prípade môže
          kupujúci kontaktovať subjekt mimosúdneho riešenia sporov.
        </p>
        <p className="font-normal text-base">
          5.3. Tieto obchodné podmienky nadobúdajú účinnosť dňom ich
          zverejnenia. Predávajúci si vyhradzuje právo zmeniť tieto obchodné
          podmienky. Zmenu obchodných podmienok predávajúci zverejní na svojich
          internetových stránkach.
        </p>
        <p className="font-normal text-base">
          5.4. Kupujúci vyjadruje súhlas s týmito obchodnými podmienkami pri
          vytvorení používateľského účtu alebo pri odoslaní objednávky.
        </p>
        <div className="font-normal text-base">
          <p className="font-normal text-base">
            5.5. Neoddeliteľnou súčasťou týchto obchodných podmienok sú aj:
          </p>
          <ul className="list-disc space-y-1">
            <li>Zásady ochrany osobných údajov</li>
            <li>Zásady používania súborov cookies</li>
          </ul>
        </div>
        <p className="mt-8 text-muted-foreground text-sm italic">
          Tieto obchodné podmienky sú platné a účinné od 1.12.2024
        </p>
      </article>
    </PageWrapper>
  );
}
