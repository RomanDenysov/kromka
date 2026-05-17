import { and, eq, gt, isNull, notInArray, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, media, products } from "@/db/schema";
import type { WeightUnit } from "@/db/types";
import { log } from "@/lib/logger";
import { SITE_NAME } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";

const CENTS_PER_EUR = 100;
const GOOGLE_CATEGORY_ID = 1868;

// Google Merchant `unit_pricing_measure` uses "ct" for count. Map our internal
// "ks" (Slovak: kusy) to "ct"; "g" and "ml" pass through.
function formatUnitPricingMeasure(
  value: number | null,
  unit: WeightUnit | null
): string | null {
  if (!(value && unit)) {
    return null;
  }
  const googleUnit = unit === "ks" ? "ct" : unit;
  return `${value}${googleUnit}`;
}

const FEED_HEADER = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
  "<channel>",
  `<title>${SITE_NAME}</title>`,
  `<link>${getSiteUrl()}</link>`,
  `<description>${SITE_NAME} - Google Shopping feed</description>`,
];
const FEED_FOOTER = ["</channel>", "</rss>"];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        priceCents: products.priceCents,
        status: products.status,
        weightValue: products.weightValue,
        weightUnit: products.weightUnit,
        imageUrl: media.url,
      })
      .from(products)
      .leftJoin(media, eq(products.imageId, media.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(products.showInB2c, true),
          notInArray(products.status, ["archived", "draft"]),
          or(isNull(products.categoryId), eq(categories.isActive, true)),
          gt(products.priceCents, 0)
        )
      );

    const items = rows.map((row) => {
      const description = row.description ?? "";
      const price = `${(row.priceCents / CENTS_PER_EUR).toFixed(2)} EUR`;
      const availability = row.status === "sold" ? "out_of_stock" : "in_stock";
      const link = getSiteUrl(`/product/${row.slug}`);
      const unitMeasure = formatUnitPricingMeasure(
        row.weightValue,
        row.weightUnit
      );

      return [
        "<item>",
        `<g:id>${escapeXml(row.id)}</g:id>`,
        `<g:title>${escapeXml(row.name)}</g:title>`,
        `<g:description>${escapeXml(description || row.name)}</g:description>`,
        `<g:link>${escapeXml(link)}</g:link>`,
        row.imageUrl
          ? `<g:image_link>${escapeXml(row.imageUrl)}</g:image_link>`
          : "",
        `<g:price>${price}</g:price>`,
        `<g:availability>${availability}</g:availability>`,
        `<g:brand>${escapeXml(SITE_NAME)}</g:brand>`,
        "<g:condition>new</g:condition>",
        `<g:google_product_category>${GOOGLE_CATEGORY_ID}</g:google_product_category>`,
        unitMeasure
          ? `<g:unit_pricing_measure>${unitMeasure}</g:unit_pricing_measure>`
          : "",
        "<g:content_language>sk</g:content_language>",
        "<g:target_country>SK</g:target_country>",
        "</item>",
      ]
        .filter(Boolean)
        .join("\n");
    });

    const xml = [...FEED_HEADER, ...items, ...FEED_FOOTER].join("\n");

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    log.db.error({ err: error }, "Google Merchant feed generation failed");

    return new Response([...FEED_HEADER, ...FEED_FOOTER].join("\n"), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=60, stale-while-revalidate",
      },
    });
  }
}
