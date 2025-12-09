import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import {
  DEFAULT_LOGO_URL,
  DEFAULT_SIGNATURE_LOGO_URL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
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
