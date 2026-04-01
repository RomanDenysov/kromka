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

export interface OrderCancelledEmailData {
  logoUrl?: string;
  orderId: string | number;
  pickupDate: string;
  pickupPlace: string;
  reason?: string;
}

export function OrderCancelledEmail({
  orderId,
  pickupPlace,
  pickupDate,
  reason,
  logoUrl,
}: OrderCancelledEmailData) {
  const formattedOrderId = formatOrderCode(orderId);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>
          Vaša objednávka {formattedOrderId} bola zrušená - Kromka
        </Preview>
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
              <Text className={EMAIL_HEADING_CLASS}>Objednávka zrušená</Text>
              <Text className="font-medium text-gray-600 text-sm">
                Číslo objednávky:{" "}
                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-xs">
                  {formattedOrderId}
                </code>
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Vaša objednávka pre predajňu{" "}
                <strong className="font-semibold text-gray-900">
                  {pickupPlace}
                </strong>{" "}
                na {pickupDate} bola zrušená.
              </Text>
            </Section>

            {reason && (
              <Section className={`${EMAIL_CARD_CLASS} mt-6`}>
                <Text className="font-semibold text-gray-900 text-sm">
                  Dôvod zrušenia
                </Text>
                <Text className={EMAIL_PARAGRAPH_CLASS}>{reason}</Text>
              </Section>
            )}

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Ak si želáte vytvoriť novú objednávku, navštívte náš e-shop.
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

export async function renderOrderCancelledEmail(data: OrderCancelledEmailData) {
  return await render(<OrderCancelledEmail {...data} />);
}
