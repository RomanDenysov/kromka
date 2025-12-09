import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import {
  DEFAULT_CONTACT_PHONES,
  DEFAULT_LOGO_URL,
  DEFAULT_SUPPORT_EMAIL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  formatOrderCode,
} from "./shared";

export type OrderConfirmationEmailData = {
  pickupPlace: string;
  pickupPlaceUrl?: string;
  pickupDate: string;
  pickupTime: string;
  orderId: string | number;
  logoUrl?: string;
};

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
    <Html>
      <Tailwind>
        <Head />
        <Preview>Už sa to pečie, už sa to chystá! - Kromka</Preview>
        <Body className={EMAIL_BODY_CLASS}>
          <Container className={EMAIL_CONTAINER_CLASS}>
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
                Práve pre vás chystáme vaše lakocinky. Keď bude všetko
                pripravené, dáme vám vedieť.
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
                <strong className="font-semibold text-gray-900">
                  Dátum a čas:
                </strong>{" "}
                {pickupDate}, {pickupTime}
              </Text>
            </Section>

            <Section className="mt-6 border-gray-200 border-t pt-4 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Máte otázky? Napíšte nám na{" "}
                <Link
                  className="text-gray-700 underline"
                  href={`mailto:${DEFAULT_SUPPORT_EMAIL}`}
                >
                  {DEFAULT_SUPPORT_EMAIL}
                </Link>
              </Text>
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-1`}>
                {DEFAULT_CONTACT_PHONES.map((contact, idx) => (
                  <span key={contact.phone}>
                    {idx > 0 && " · "}
                    <Link
                      className="text-gray-700 underline"
                      href={`tel:${contact.phone}`}
                    >
                      {contact.label}
                    </Link>
                  </span>
                ))}
              </Text>
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-3`}>
                © 2025 Všetky práva vyhradené pre Kromka s.r.o.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
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
