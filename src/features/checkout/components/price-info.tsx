import { formatPrice } from "@/lib/utils";

export function PriceInfo({ totalCents }: { totalCents: number }) {
  return (
    <div className="flex flex-row items-center justify-between">
      <span className="font-medium text-lg">Spolu</span>
      <span className="font-semibold text-lg">{formatPrice(totalCents)}</span>
    </div>
  );
}
