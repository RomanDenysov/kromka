import { Img, Link, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_CARD_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  formatOrderCode,
} from "./shared";

export interface OrderConfirmationEmailData {
  logoUrl?: string;
  orderId: string | number;
  pickupDate: string;
  pickupPlace: string;
  pickupPlaceUrl?: string;
  pickupTime: string;
}

/**
 * Follows up with customers letting them know the order is processing.
 */
export function OrderConfirmationEmail({
  pickupPlace,
  pickupPlaceUrl,
  pickupDate,
  pickupTime,
  orderId,
  logoUrl,
}: OrderConfirmationEmailData) {
  const formattedOrderId = formatOrderCode(orderId);

  return (
    <EmailLayout preview="Už sa to pečie, už sa to chystá! - Kromka">
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="96"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="96"
        />
        <Text className={EMAIL_HEADING_CLASS}>
          Už sa to pečie, už sa to chystá! 👍🏻
        </Text>
        <Text className="font-medium text-gray-600 text-sm">
          Číslo vašej objednávky:{" "}
          <code className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-xs">
            {formattedOrderId}
          </code>
        </Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Práve pre vás chystáme vaše lakocinky. Keď bude všetko pripravené,
          dáme vám vedieť.
        </Text>
      </Section>

      <Section className={`${EMAIL_CARD_CLASS} mt-6 space-y-4`}>
        <Text className="font-semibold text-gray-900 text-sm">
          Vyzdvihnutie objednávky
        </Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Svoju objednávku si môžete vyzdvihnúť na vami zvolenej predajni:
        </Text>
        {pickupPlaceUrl ? (
          <Link
            className="font-semibold text-base text-blue-600 underline"
            href={pickupPlaceUrl}
          >
            {pickupPlace}
          </Link>
        ) : (
          <Text className="font-semibold text-base text-gray-900">
            {pickupPlace}
          </Text>
        )}
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          <strong className="font-semibold text-gray-900">Dátum a čas:</strong>{" "}
          {pickupDate}, {pickupTime}
        </Text>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the order confirmation email.
 */
export async function renderOrderConfirmationEmail(
  data: OrderConfirmationEmailData
) {
  return await render(<OrderConfirmationEmail {...data} />);
}
