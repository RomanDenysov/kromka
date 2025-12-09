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
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

type SupportConfirmationEmailData = {
  logoUrl?: string;
};

/**
 * Confirmation email sent to user after they submit a support request.
 */
export function SupportConfirmationEmail({
  logoUrl,
}: SupportConfirmationEmailData) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Vaša žiadosť o podporu bola prijatá – Kromka</Preview>
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
                Ďakujeme za vašu správu! ✅
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Vaša žiadosť o podporu bola úspešne prijatá a náš tím sa vám čo
                najskôr ozve.
              </Text>
            </Section>

            <Section className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5 text-gray-700 leading-6">
              <Text className="font-semibold text-gray-900 text-sm">
                Čo ďalej?
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Náš tím podpory prešiel vašu správu a pracuje na jej vyriešení.
                Odošleme vám odpoveď na emailovú adresu, ktorú ste poskytli.
              </Text>
              <Text className={`${EMAIL_PARAGRAPH_CLASS} mt-3`}>
                Očakávaná doba odozvy je do 24 hodín v pracovných dňoch.
              </Text>
            </Section>

            <Section className="mt-6 border-gray-200 border-t pt-4 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Máte ďalšie otázky? Napíšte nám na{" "}
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
 * Helper that renders the support confirmation email template.
 */
export async function renderSupportConfirmationEmail(
  data: SupportConfirmationEmailData
) {
  return await render(<SupportConfirmationEmail {...data} />);
}
