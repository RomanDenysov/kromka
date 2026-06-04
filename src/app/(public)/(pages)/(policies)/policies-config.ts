import type { Route } from "next";

interface PolicyLink {
  href: Route;
  label: string;
}

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
