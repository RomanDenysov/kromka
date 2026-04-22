import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import { getProducts } from "@/features/products/api/queries";
import { formatPrice } from "@/lib/utils";

export const alt = "Pekaren Kromka - Produkt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const allProducts = await getProducts();
  return allProducts.map((p) => ({ slug: p.slug }));
}

/** Avoids Satori fetching remote URLs after prerender completes (build failures). */
async function imageUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const mimeType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Geist latin-ext ships with Next; preloading avoids Satori’s deferred font fetches (see next/og + opengraph-image docs). */
async function loadOgGeistFont(): Promise<Buffer> {
  try {
    const require = createRequire(fileURLToPath(import.meta.url));
    const resolved = require.resolve(
      "next/dist/next-devtools/server/font/geist-latin-ext.woff2"
    );
    return await readFile(resolved);
  } catch {
    const fallback = join(
      process.cwd(),
      "node_modules/next/dist/next-devtools/server/font/geist-latin-ext.woff2"
    );
    return await readFile(fallback);
  }
}

function ogImageOptions(geistData: Buffer) {
  return {
    ...size,
    fonts: [
      {
        name: "Geist",
        data: geistData,
        style: "normal" as const,
        weight: 400 as const,
      },
      {
        name: "Geist",
        data: geistData,
        style: "normal" as const,
        weight: 700 as const,
      },
      {
        name: "Geist",
        data: geistData,
        style: "normal" as const,
        weight: 900 as const,
      },
    ],
  };
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const geistData = await loadOgGeistFont();
  const imageOpts = ogImageOptions(geistData);

  const { slug } = await params;
  const urlDecoded = decodeURIComponent(slug);
  const products = await getProducts();
  const product = products.find((p) => p.slug === urlDecoded);

  if (!product) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f4",
          color: "#1c1917",
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "Geist",
        }}
      >
        Produkt nenajdeny
      </div>,
      imageOpts
    );
  }

  const logoData = await readFile(
    join(process.cwd(), "public", "kromka-sign.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  const price = formatPrice(product.priceCents);
  const productImageDataUrl = product.imageUrl
    ? await imageUrlToDataUrl(product.imageUrl)
    : null;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        color: "#1c1917",
        fontFamily: "Geist",
      }}
    >
      {/* Left - content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          width: productImageDataUrl ? "50%" : "100%",
          height: "100%",
        }}
      >
        {/* biome-ignore lint/a11y/useAltText: OG image */}
        {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
        <img height={28} src={logoSrc} width={140} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {product.category?.name && (
            <span
              style={{
                fontSize: 18,
                color: "#78716c",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {product.category.name}
            </span>
          )}
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {product.name}
          </span>
          <span style={{ fontSize: 40, fontWeight: 700 }}>{price}</span>
        </div>

        <span style={{ fontSize: 18, color: "#a8a29e" }}>pekarenkromka.sk</span>
      </div>

      {/* Right - product image, full bleed */}
      {productImageDataUrl && (
        <div style={{ display: "flex", width: "50%", height: "100%" }}>
          {/* biome-ignore lint/a11y/useAltText: OG image */}
          {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
          <img
            height={630}
            src={productImageDataUrl}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            width={600}
          />
        </div>
      )}
    </div>,
    imageOpts
  );
}
