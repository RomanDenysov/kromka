import { AlertCircleIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CheckoutFormData } from "@/features/checkout/schema";

type CheckoutAlertsProps = {
  ordersEnabled: boolean;
  formErrors: FieldErrors<CheckoutFormData>;
};

/**
 * Consolidates checkout-related alerts for orders disabled, user info, and form errors.
 * Note: Pickup date alerts are handled in PickupDateAlerts component.
 */
export function CheckoutAlerts({
  ordersEnabled,
  formErrors,
}: CheckoutAlertsProps) {
  const hasFormErrors = Object.keys(formErrors).length > 0;
  const hasCustomerInfoErrors =
    formErrors.name || formErrors.email || formErrors.phone;

  return (
    <>
      {!ordersEnabled && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Aktuálne nie je možné objednať na stránke</AlertTitle>
          <AlertDescription className="text-xs">
            Prosím, kontaktujte nás cez email alebo telefón. Alebo na predajni.
          </AlertDescription>
        </Alert>
      )}

      {hasCustomerInfoErrors && (
        <Alert variant="default">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Vyplňte osobné údaje</AlertTitle>
          <AlertDescription className="text-xs">
            Pred vytvorením objednávky vyplňte všetky kontaktné údaje.
          </AlertDescription>
        </Alert>
      )}

      {hasFormErrors && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Chyba vo formulári</AlertTitle>
          <AlertDescription className="text-xs">
            {Object.values(formErrors)
              .slice(0, 1)
              .map((error) => error?.message)
              .filter(Boolean)
              .join(", ")}
            {Object.keys(formErrors).length > 1 && (
              <span className="text-xs">
                {" "}
                a {Object.keys(formErrors).length - 1} ďalších chybách
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

type PickupDateAlertsProps = {
  hasNoAvailableDates: boolean;
  restrictedPickupDates: Set<string> | null;
};

/**
 * Alerts specific to pickup date restrictions (shown in pickup details card).
 */
export function PickupDateAlerts({
  hasNoAvailableDates,
  restrictedPickupDates,
}: PickupDateAlertsProps) {
  return (
    <>
      {hasNoAvailableDates && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Žiadne dostupné dátumy</AlertTitle>
          <AlertDescription className="text-xs">
            Produkty v košíku majú rôzne dostupné dni vyzdvihnutia, ktoré sa
            neprekrývajú. Nie je možné vybrať dátum, ktorý by vyhovoval všetkým
            produktom. Prosím, odstráňte niektoré produkty z košíka alebo
            kontaktujte nás.
          </AlertDescription>
        </Alert>
      )}

      {restrictedPickupDates &&
        restrictedPickupDates.size > 0 &&
        !hasNoAvailableDates && (
          <Alert variant="default">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Obmedzené dátumy vyzdvihnutia</AlertTitle>
            <AlertDescription className="text-xs">
              Niektoré produkty v košíku sú dostupné len v určité dni. Zobrazia
              sa vám len dostupné dátumy.
            </AlertDescription>
          </Alert>
        )}
    </>
  );
}
