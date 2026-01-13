import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";

type CheckoutMobileFooterProps = {
  totalCents: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  ordersEnabled: boolean;
  hasNoAvailableDates: boolean;
};

/**
 * Mobile sticky footer with total price and submit button.
 * Only visible on mobile viewports (below sm breakpoint).
 */
export function CheckoutMobileFooter({
  totalCents,
  isSubmitting,
  canSubmit,
  ordersEnabled,
  hasNoAvailableDates,
}: CheckoutMobileFooterProps) {
  const isDisabled =
    isSubmitting || !canSubmit || !ordersEnabled || hasNoAvailableDates;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg sm:hidden">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Celkom</span>
          <span className="font-bold text-lg">{formatPrice(totalCents)}</span>
        </div>
        <Button
          className="flex-1 text-base"
          disabled={isDisabled}
          form="checkout-form"
          size="lg"
          type="submit"
        >
          {isSubmitting && <Spinner />}
          Objednať
        </Button>
      </div>
    </div>
  );
}
