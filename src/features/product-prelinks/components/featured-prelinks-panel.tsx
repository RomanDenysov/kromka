import Image from "next/image";
import Link from "next/link";
import { getPrelinksByProductId } from "@/features/product-prelinks/api/queries";
import { formatPrice } from "@/lib/utils";
import { PrelinkAddButton } from "./prelink-add-button";

interface Props {
  productId: string;
}

const DEFAULT_HEADING = "Pre väčšiu spoločnosť?";

export async function FeaturedPrelinksPanel({ productId }: Props) {
  const prelinks = await getPrelinksByProductId(productId);
  if (prelinks.length === 0) {
    return null;
  }

  // Use the first prelink's label as the panel heading if any link has one;
  // otherwise the generic Slovak fallback. Per-card labels feel cluttered in
  // the v1 layout, so the section heading carries the editorial voice.
  const heading =
    prelinks.find((p) => p.label && p.label.trim().length > 0)?.label ??
    DEFAULT_HEADING;

  return (
    <section
      aria-labelledby="prelinks-heading"
      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-4"
    >
      <h2
        className="font-semibold text-base uppercase tracking-wide"
        id="prelinks-heading"
      >
        {heading}
      </h2>
      <ul className="flex flex-col gap-3">
        {prelinks.map((link) => {
          const lp = link.linkedProduct;
          return (
            <li className="flex items-center gap-3" key={link.linkedProductId}>
              <Link
                aria-label={lp.name}
                className="relative size-16 shrink-0 overflow-hidden rounded-md bg-background"
                href={`/product/${lp.slug}`}
              >
                {lp.imageUrl ? (
                  <Image
                    alt={lp.name}
                    className="object-cover"
                    fill
                    sizes="64px"
                    src={lp.imageUrl}
                  />
                ) : null}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  className="line-clamp-2 font-semibold text-sm hover:underline"
                  href={`/product/${lp.slug}`}
                >
                  {lp.name}
                </Link>
                <span className="font-medium text-muted-foreground text-sm">
                  {formatPrice(lp.priceCents)}
                </span>
              </div>
              <PrelinkAddButton
                priceCents={lp.priceCents}
                productId={lp.id}
                productName={lp.name}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
