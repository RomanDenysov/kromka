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
  EMAIL_SUBTITLE_CLASS,
  formatOrderCode,
  getCopyrightText,
} from "./shared";

interface PickupDetails {
  pickupDate: string;
  pickupPlace: string;
  pickupPlaceUrl?: string;
  pickupTime: string;
}

export interface OrderPickupUpdatedEmailData {
  changedBy?: { name: string; email: string };
  customer?: {
    name: string;
    email: string;
    phone?: string | null;
    isRegistered: boolean;
  };
  logoUrl?: string;
  orderId: string | number;
  orderUrl: string;
  previous: PickupDetails;
  updated: PickupDetails;
}

export function OrderPickupUpdatedEmail({
  orderId,
  orderUrl,
  previous,
  updated,
  logoUrl,
  changedBy,
  customer,
}: OrderPickupUpdatedEmailData) {
  const formattedOrderId = formatOrderCode(orderId);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Zmena vyzdvihnutia objednávky {formattedOrderId}</Preview>
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
                Vyzdvihnutie bolo zmenené
              </Text>
              <Text className="font-medium text-gray-600 text-sm">
                Číslo objednávky:{" "}
                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-xs">
                  {formattedOrderId}
                </code>
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Údaje o vyzdvihnutí vašej objednávky boli aktualizované.
              </Text>
            </Section>

            {changedBy ? (
              <Section className={`${EMAIL_CARD_CLASS} mt-6`}>
                <Text className={`${EMAIL_SUBTITLE_CLASS} mb-2`}>Zmenil/a</Text>
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">
                    {changedBy.name}
                  </strong>{" "}
                  (
                  <Link
                    className="text-gray-700 underline"
                    href={`mailto:${changedBy.email}`}
                  >
                    {changedBy.email}
                  </Link>
                  )
                </Text>
              </Section>
            ) : null}

            <Section
              className={`${EMAIL_CARD_CLASS} ${changedBy ? "mt-3" : "mt-6"}`}
            >
              <Text className={`${EMAIL_SUBTITLE_CLASS} mb-2`}>
                Pôvodné údaje
              </Text>
              <Text className={`${EMAIL_PARAGRAPH_CLASS} line-through`}>
                {previous.pickupPlace} - {previous.pickupDate},{" "}
                {previous.pickupTime}
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-3`}>
              <Text className={`${EMAIL_SUBTITLE_CLASS} mb-2`}>Nové údaje</Text>
              {updated.pickupPlaceUrl ? (
                <Link
                  className="font-semibold text-base text-blue-600 underline"
                  href={updated.pickupPlaceUrl}
                >
                  {updated.pickupPlace}
                </Link>
              ) : (
                <Text className="font-semibold text-base text-gray-900">
                  {updated.pickupPlace}
                </Text>
              )}
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Dátum a čas:
                </strong>{" "}
                {updated.pickupDate}, {updated.pickupTime}
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Link
                className="inline-block rounded-md bg-gray-800 px-4 py-2 font-medium text-sm text-white"
                href={orderUrl}
              >
                Zobraziť objednávku
              </Link>
            </Section>

            {customer ? (
              <Section className={`${EMAIL_CARD_CLASS} mt-6`}>
                <Text className={`${EMAIL_SUBTITLE_CLASS} mb-2`}>
                  Zákazník{" "}
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 font-medium text-xs ${customer.isRegistered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {customer.isRegistered ? "Registrovaný" : "Neregistrovaný"}
                  </span>
                </Text>
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">Meno:</strong>{" "}
                  {customer.name}
                </Text>
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">
                    Email:
                  </strong>{" "}
                  <Link
                    className="text-gray-700 underline"
                    href={`mailto:${customer.email}`}
                  >
                    {customer.email}
                  </Link>
                </Text>
                {customer.phone ? (
                  <Text className={EMAIL_PARAGRAPH_CLASS}>
                    <strong className="font-semibold text-gray-900">
                      Telefón:
                    </strong>{" "}
                    <Link
                      className="text-gray-700 underline"
                      href={`tel:${customer.phone}`}
                    >
                      {customer.phone}
                    </Link>
                  </Text>
                ) : null}
              </Section>
            ) : null}

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

export async function renderOrderPickupUpdatedEmail(
  data: OrderPickupUpdatedEmailData
) {
  return await render(<OrderPickupUpdatedEmail {...data} />);
}
