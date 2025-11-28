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
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

type ContactPhone = {
  label: string;
  phone: string;
};

export type OrderConfirmationEmailData = {
  pickupPlace: string;
  pickupPlaceUrl?: string;
  logoUrl?: string;
  contactPhones?: ContactPhone[];
};

/**
 * Follows up with customers letting them know the order is processing.
 */
export function OrderConfirmationEmail({
  pickupPlace,
  pickupPlaceUrl,
  logoUrl,
  contactPhones,
}: OrderConfirmationEmailData) {
  const phones = contactPhones ?? DEFAULT_CONTACT_PHONES;

  return (
    <Html>
      <Head />
      <Preview>Už sa to pečie, už sa to chystá! - Kromka</Preview>
      <Tailwind>
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
                Už sa to pečie, už sa to chystá!
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
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Presný čas vyzdvihnutia sa riadi aktuálnou otváracou dobou
                predajne.
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-2`}>
              <Text className="font-semibold text-gray-900 text-sm">
                Potrebujete pomoc?
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Ak máte nejaké otázky, kontaktujte nás na uvedených telefónnych
                číslach:
              </Text>
              <div className="space-y-2">
                {phones.map((contact) => (
                  <Text className="text-gray-800 text-sm" key={contact.phone}>
                    {contact.label}:{" "}
                    <Link
                      className="text-blue-600 underline"
                      href={`tel:${contact.phone}`}
                    >
                      {contact.phone}
                    </Link>
                  </Text>
                ))}
              </div>
            </Section>

            <Section className="mt-8 border-gray-200 border-t pt-6 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Ďakujeme, že ste si vybrali Kromku. Na potvrdenie o dokončení
                objednávky vás budeme ešte informovať.
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
