import type { Metadata } from "next";
import { getSiteUrl } from "./utils";

const siteName = "Pekáreň Kromka";

const author: Metadata["authors"] = {
  name: siteName,
  url: "https://www.pekarenkromka.sk",
};

export const defaultMetadata: Metadata = {
  applicationName: siteName,
  authors: [author],
  creator: author.name,
  publisher: author.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.pekarenkromka.sk"),
  openGraph: {
    type: "website",
    siteName,
    locale: "sk_SK",
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-168x168.png", sizes: "168x168", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon",
        url: "/icons/icon-192x192.png",
      },
    ],
  },
  manifest: getSiteUrl("/site.webmanifest"),
  alternates: {
    canonical: getSiteUrl(),
  },
};

type MetadataGenerator = Omit<Metadata, "description" | "title"> & {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
};

export function createMetadata(props: MetadataGenerator): Metadata {
  return {
    ...defaultMetadata,
    ...props,
    openGraph: {
      ...defaultMetadata.openGraph,
      images: props.image ? [{ url: props.image }] : [],
    },
    alternates: {
      ...defaultMetadata.alternates,
      canonical: props.canonicalUrl,
    },
  };
}
