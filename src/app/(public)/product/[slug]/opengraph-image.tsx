import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
          backgroundColor: "#f5f5f4",
          color: "#1c1917",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        Produkt nenajdeny
      </div>,
      { ...size }
    );
  }

  const logoData = await readFile(
    join(process.cwd(), "public", "kromka-sign.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  const price = formatPrice(product.priceCents);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f4",
        color: "#1c1917",
      }}
    >
      {/* Left content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          width: product.imageUrl ? "55%" : "100%",
          height: "100%",
        }}
      >
        {/* biome-ignore lint/a11y/useAltText: OG image */}
        {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
        <img height={32} src={logoSrc} width={160} />

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
              fontSize: product.imageUrl ? 48 : 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {product.name}
          </span>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#44403c" }}>
            {price}
          </span>
        </div>

        <span style={{ fontSize: 18, color: "#a8a29e" }}>pekarenkromka.sk</span>
      </div>

      {/* Right - product image */}
      {product.imageUrl && (
        <div
          style={{
            display: "flex",
            width: "45%",
            height: "100%",
            padding: "40px 40px 40px 0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* biome-ignore lint/a11y/useAltText: OG image */}
          {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
          <img
            height={480}
            src={product.imageUrl}
            style={{
              borderRadius: "16px",
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            width={480}
          />
        </div>
      )}
    </div>,
    { ...size }
  );
}
