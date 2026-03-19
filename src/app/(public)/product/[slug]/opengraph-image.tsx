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
        backgroundColor: "#fff",
        color: "#1c1917",
      }}
    >
      {/* Left - content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          width: product.imageUrl ? "50%" : "100%",
          height: "100%",
        }}
      >
        {/* biome-ignore lint/a11y/useAltText: OG image */}
        {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
        <img height={28} src={logoSrc} width={140} />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
      </div>

      {/* Right - product image, full bleed */}
      {product.imageUrl && (
        <div style={{ display: "flex", width: "50%", height: "100%" }}>
          {/* biome-ignore lint/a11y/useAltText: OG image */}
          {/* biome-ignore lint/performance/noImgElement: Satori requires native img */}
          <img
            height={630}
            src={product.imageUrl}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            width={600}
          />
        </div>
      )}
    </div>,
    { ...size }
  );
}
