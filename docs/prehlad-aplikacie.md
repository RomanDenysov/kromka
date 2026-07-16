# Prehľad aplikácie - čo je hotové

Stručný prehľad funkcionality pre manažment. Písané ľudskou rečou, bez technických detailov.

Stav k: júl 2026

---

## Čo aplikácia dnes robí

### Pre zákazníkov (online pekáreň s vyzdvihnutím)

- **Prehliadanie a objednávanie** - zákazník si prezerá produkty podľa kategórií, otvorí detail produktu a pridá tovar do košíka.
- **Objednávka na vyzdvihnutie** - vyberie si predajňu, deň a časové okno, kedy si objednávku vyzdvihne. Systém pozná otváracie hodiny každej predajne, sviatky aj zatvorenia a ponúkne len platné časy. Platí logika uzávierky (objednávka pred obedom = vyzdvihnutie zajtra, po obede = pozajtra).
- **Nákup ako hosť alebo prihlásený** - účet nie je povinný; prihlásení zákazníci majú údaje predvyplnené.
- **Objednať znova na jeden klik** - banner "objednať znova" ukáže poslednú objednávku a zákazník ju zopakuje okamžite.
- **Sledovanie objednávky** - zákazník vidí, ako sa mení stav objednávky (nová → pripravuje sa → pripravená → vyzdvihnutá) a dostáva e-maily pri každom kroku.
- **Obľúbené** - ukladanie produktov medzi obľúbené.
- **Účty a prihlásenie** - cez magic link (e-mail) alebo Google.
- **Blog** - články, komentáre, "páči sa mi".
- **Vyhľadanie predajní** - mapa so všetkými predajňami, otváracími hodinami a navigáciou.
- **Kontaktný formulár** - napísať nám z ktorejkoľvek stránky.

### Pre kanceláriu / administráciu (chod firmy)

- **Objednávky** - prehľad všetkých objednávok, zmena stavu, úprava vyzdvihnutia, zrušenie, hromadné spracovanie. E-maily odchádzajú automaticky.
- **Produkty** - kompletná správa: vytvorenie, úprava, duplikovanie, aktivácia/deaktivácia, cena, hmotnosť, fotky, alergény.
- **Kategórie a predajne** - správa štruktúry katalógu a predajní (vrátane otváracích hodín a výnimiek).
- **Blog** - písanie a publikovanie článkov, moderovanie komentárov.
- **Knižnica médií** - nahrávanie a opätovné použitie obrázkov (automatická optimalizácia).
- **Zákazníci / používatelia** - prehľad všetkých používateľov, ich rolí, objednávok a aktivity.
- **Prehľad aktivity** - živý záznam "čo sa deje v obchode" (nové objednávky, zmeny stavov, úpravy produktov) pre kontrolu.
- **Denný prehľad** - bočný panel s objednávkami vybraného dňa a tým, čo treba pripraviť.
- **Nastavenia** - zapínanie/vypínanie funkcií (napr. pozastavenie online objednávok).
- **Export dát** - export objednávok/produktov/používateľov do Excelu/CSV.

### Pre firemných (B2B) partnerov - strana administrácie

- **Žiadosti partnerov** - firmy sa prihlásia online; my ich posúdime a schválime alebo zamietneme. Schválenie vytvorí firemný účet a pozvánku.
- **Správa klientov** - správa fakturačných údajov, IČO/DIČ, prehľad objednávok a tržieb každého partnera (naše odľahčené CRM).
- **Individuálne ceny** - cenové úrovne, aby rôzni partneri mali rôzne ceny.
- **Fakturácia** - zoskupenie neuhradených objednávok partnera do faktúry, vystavenie, označenie ako uhradené.

### Reporty

- **Reporty ziskovosti** - ktoré produkty a ktoré predajne zarábajú najviac, s rebríčkom a exportom.
- **Kalkulácia receptúr** - katalóg surovín s cenami, receptúry z nich zostavené a automatický výpočet reálnej ceny každého produktu.
- **Výživové hodnoty a alergény** - zobrazené zákazníkom na stránke produktu, vypočítané z receptúr.

---

## Čo je rozpracované / ešte nie je hotové

- **Online platby** - zákazníci momentálne platia na predajni; platba kartou cez platobnú bránu ešte nie je napojená.
- **B2B online objednávanie** - partneri sú spravovaní a fakturovaní, ale zatiaľ si nemôžu sami zadať objednávku cez web (ich objednávky riešime manuálne).
- **Nástroje pre vedúceho predajne** - aplikácia pre vedúceho na predajni (denné vyzdvihnutia, objednávanie tovaru, evidencia odpadu, QR odovzdanie) je pripravená ako kostra, ale funkčné obrazovky ešte nie sú dorobené.
- **Napojenie na pokladňu (POS)** - nezačaté.

---

## Zhrnutie jednou vetou

Zákaznícky obchod s vyzdvihnutím a celý back-office (objednávky, produkty, blog, B2B partneri, fakturácia, reporty, kalkulácia receptúr) sú spustené a fungujú. Ešte príde: online platby kartou, samoobslužné objednávanie pre partnerov, aplikácia pre vedúceho predajne a napojenie na pokladňu.
