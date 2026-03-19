import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProducts } from "@/features/products/api/queries";
import { formatPrice } from "@/lib/utils";

export const alt = "Pekáreň Kromka - Produkt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WOFF2_URL_RE = /src:\s*url\(([^)]+)\)\s*format\('woff2'\)/;

export async function generateStaticParams() {
  const allProducts = await getProducts();
  return allProducts.map((p) => ({ slug: p.slug }));
}

async function loadLogoBase64() {
  const logoPath = join(process.cwd(), "public", "logo-kromka.png");
  const logoBuffer = await readFile(logoPath);
  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
}

async function loadFont() {
  const res = await fetch(
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
  );
  const css = await res.text();

  const fontUrlMatch = css.match(WOFF2_URL_RE);

  if (!fontUrlMatch?.[1]) {
    return null;
  }

  const fontRes = await fetch(fontUrlMatch[1]);
  return fontRes.arrayBuffer();
}

async function loadProductImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/webp";
    const buffer = await res.arrayBuffer();
    return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
          backgroundColor: "#1a1a1a",
          color: "#fff",
          fontSize: 48,
        }}
      >
        Produkt nenájdený
      </div>,
      { ...size }
    );
  }

  const [logoSrc, fontData, productImageSrc] = await Promise.all([
    loadLogoBase64(),
    loadFont(),
    product.imageUrl ? loadProductImage(product.imageUrl) : null,
  ]);

  const price = formatPrice(product.priceCents);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Left content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          width: productImageSrc ? "58%" : "100%",
          height: "100%",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* biome-ignore lint/a11y/useAltText: OG image - not rendered in browser */}
          {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
          <img
            height={48}
            src={logoSrc}
            style={{ borderRadius: "50%", filter: "invert(1)" }}
            width={48}
          />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#d4d4d4",
              letterSpacing: "-0.02em",
            }}
          >
            Pekáreň Kromka
          </span>
        </div>

        {/* Product info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {product.category?.name && (
            <span
              style={{
                fontSize: 18,
                color: "#a3a3a3",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {product.category.name}
            </span>
          )}
          <span
            style={{
              fontSize: productImageSrc ? 48 : 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </span>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#f5f5f5",
            }}
          >
            {price}
          </span>
        </div>

        {/* Domain */}
        <span style={{ fontSize: 18, color: "#737373" }}>pekarenkromka.sk</span>
      </div>

      {/* Right side - product image */}
      {productImageSrc && (
        <div
          style={{
            display: "flex",
            width: "42%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 40px 40px 0",
          }}
        >
          {/* biome-ignore lint/a11y/useAltText: OG image - not rendered in browser */}
          {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
          <img
            height={500}
            src={productImageSrc}
            style={{
              borderRadius: "16px",
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            width={500}
          />
        </div>
      )}
    </div>,
    {
      ...size,
      fonts: fontData
        ? [{ name: "Inter", data: fontData, style: "normal" as const }]
        : [],
    }
  );
}
