import type { Route } from "next";

type PolicyLink = {
  label: string;
  href: Route;
};

export const POLICY_LINKS: Record<string, PolicyLink> = {
  obchodnePodmienky: {
    label: "Obchodné podmienky",
    href: "/obchodne-podmienky",
  },
  ochranaOsobnychUdajov: {
    label: "Ochrana osobných údajov",
    href: "/ochrana-osobnych-udajov",
  },
  pouzivanieCookies: {
    label: "Používanie cookies",
    href: "/pouzivanie-cookies",
  },
} as const;

export const COMPANY_INFO = {
  name: "KROMKA s.r.o.",
  ico: "46 670 068",
  address: "ul. 17. novembra 8288/106, Prešov 080 01",
  email: "kromka@kavejo.sk",
  court: "Okresný súd Prešov, Oddiel: Sro, Vložka číslo: 26041/P",
} as const;
