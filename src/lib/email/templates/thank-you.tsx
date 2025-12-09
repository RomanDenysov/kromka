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
  EMAIL_MUTED_TEXT_CLASS,
  formatOrderCode,
} from "./shared";

export type ThankYouEmailData = {
  orderId?: string | number;
  logoUrl?: string;
  signatureLogoUrl?: string;
};

/**
 * Friendly thank-you message after the order lifecycle is completed.
 */
export function ThankYouEmail({
  orderId,
  logoUrl,
  signatureLogoUrl,
}: ThankYouEmailData) {
  const formattedOrderId =
    typeof orderId === "undefined" ? undefined : formatOrderCode(orderId);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Ďakujeme za vašu objednávku - Kromka</Preview>
        <Body className={EMAIL_BODY_CLASS}>
          <Container className={EMAIL_CONTAINER_CLASS}>
            <Section className="text-center">
              <Img
                alt="Kromka Logo"
                className="mx-auto mb-4"
                height="80"
                src={logoUrl ?? DEFAULT_LOGO_URL}
                width="80"
              />
              <Text className={EMAIL_HEADING_CLASS}>
                Ďakujeme, že máte radi naše lakocinky!
              </Text>
              {formattedOrderId ? (
                <Text className="font-medium text-gray-600 text-sm">
                  Číslo vašej objednávky: {formattedOrderId}
                </Text>
              ) : null}
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className="text-base text-gray-800">
                Tešíme sa na vás aj nabudúce. Zatiaľ si nás môžete pozrieť na
                našich sociálnych sieťach alebo sa zastavte na kávičku.
              </Text>
              <Text className="mt-4 text-base text-gray-900 italic">
                Váš tím pekárne Kromka
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Img
                alt="Kromka Logo"
                className="mx-auto"
                height="48"
                src={signatureLogoUrl ?? DEFAULT_SIGNATURE_LOGO_URL}
                width="48"
              />
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-4`}>
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
 * Helper that renders the thank-you email template.
 */
export async function renderThankYouEmail(data: ThankYouEmailData) {
  return await render(<ThankYouEmail {...data} />);
}
