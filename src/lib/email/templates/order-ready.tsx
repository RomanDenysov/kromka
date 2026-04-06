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
  getCopyrightText,
} from "./shared";

export interface OrderReadyEmailData {
  logoUrl?: string;
  orderId: string | number;
  pickupDate: string;
  pickupPlace: string;
  pickupPlaceUrl: string;
  pickupTime: string;
}

/**
 * Notifies the customer that their order is ready for pickup.
 */
export function OrderReadyEmail({
  pickupPlace,
  pickupPlaceUrl,
  pickupDate,
  pickupTime,
  logoUrl,
  orderId,
}: OrderReadyEmailData) {
  const formattedOrderId =
    typeof orderId === "undefined" ? undefined : formatOrderCode(orderId);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Vaše lakocinky sú nachystané, príďte do Kromky!</Preview>
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
                Vaše lakocinky sú nachystané!
              </Text>
              {formattedOrderId ? (
                <Text className="font-medium text-gray-600 text-sm">
                  Číslo vašej objednávky: {formattedOrderId}
                </Text>
              ) : null}
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Tešíme sa na vašu návštevu. Objednávka na vás počká na našej
                predajni:
                <br />
                <Link
                  className="font-semibold text-gray-900 underline"
                  href={pickupPlaceUrl}
                >
                  {pickupPlace}
                </Link>
                .
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Vyzdvihnut ju môžete v čase:{" "}
                <strong className="font-semibold text-gray-900">
                  {pickupDate}, {pickupTime}
                </strong>
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className="font-semibold text-base text-gray-900">
                Ďakujeme, že máte radi chlieb, lakocinky a kávu tak ako my!
                🫶🏻☕🥐
              </Text>
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Po vyzdvihnutí objednávky nám môžete dať vedieť, ako vám
                chutilo.
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
                {getCopyrightText()}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/**
 * Helper that renders the order-ready email template.
 */
export async function renderOrderReadyEmail(data: OrderReadyEmailData) {
  return await render(<OrderReadyEmail {...data} />);
}
