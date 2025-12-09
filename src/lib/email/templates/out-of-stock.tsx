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
  DEFAULT_SIGNATURE_LOGO_URL,
  DEFAULT_SUPPORT_EMAIL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

export type OutOfStockEmailData = {
  productName: string;
  logoUrl?: string;
  signatureLogoUrl?: string;
};

/**
 * Notifies customers about unavailable products.
 */
export function OutOfStockEmail({
  productName,
  logoUrl,
  signatureLogoUrl,
}: OutOfStockEmailData) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Produkt momentálne nie je k dispozícii - Kromka</Preview>
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
              <Text className={EMAIL_HEADING_CLASS}>Veľmi nás to mrzí</Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Produkt &ldquo;{productName}&rdquo; aktuálne nie je k
                dispozícii. Robíme všetko preto, aby sme ho čím skôr
                naskladnili.
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className="font-semibold text-base text-gray-900">
                Ďakujeme vám za trpezlivosť.
              </Text>
              <Text className="text-base text-gray-800 italic">
                Vaša Kromka
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Img
                alt="Kromka Logo"
                className="mx-auto"
                height="64"
                src={signatureLogoUrl ?? DEFAULT_SIGNATURE_LOGO_URL}
                width="64"
              />
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
 * Helper that renders the out-of-stock email.
 */
export async function renderOutOfStockEmail(data: OutOfStockEmailData) {
  return await render(<OutOfStockEmail {...data} />);
}
