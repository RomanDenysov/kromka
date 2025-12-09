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
} from "./shared";

export type ThankYouEmailData = {
  logoUrl?: string;
  signatureLogoUrl?: string;
};

/**
 * Friendly thank-you message after the order lifecycle is completed.
 */
export function ThankYouEmail({
  logoUrl,
  signatureLogoUrl,
}: ThankYouEmailData) {
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
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className="text-base text-gray-800">
                Tešíme sa na vás aj nabudúce. Zatiaľ si nás môžete pozrieť na
                našich sociálnych sieťach alebo sa zastavte na kávičku.
              </Text>
              <Text className="mt-4 text-base text-gray-900 italic">
                Váš tím pekárne Kromka 👋🏻
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
 * Helper that renders the thank-you email template.
 */
export async function renderThankYouEmail(data: ThankYouEmailData) {
  return await render(<ThankYouEmail {...data} />);
}
