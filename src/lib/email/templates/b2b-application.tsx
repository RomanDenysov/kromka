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
import type { Address } from "@/db/types";
import {
  DEFAULT_LOGO_URL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  EMAIL_SUBTITLE_CLASS,
} from "./shared";

type B2BApplicationEmailData = {
  applicationId: string;
  companyName: string;
  ico: string;
  dic?: string | null;
  icDph?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress?: Address | null;
  message?: string | null;
  logoUrl?: string;
};

function formatAddress(address: Address | null | undefined): string {
  if (!address) {
    return "Nevyplnené";
  }
  const parts: string[] = [];
  if (address.street) {
    parts.push(address.street);
  }
  if (address.postalCode || address.city) {
    parts.push([address.postalCode, address.city].filter(Boolean).join(" "));
  }
  if (address.country) {
    parts.push(address.country);
  }
  return parts.length > 0 ? parts.join(", ") : "Nevyplnené";
}

/**
 * Email template sent to staff when a B2B application is submitted.
 */
export function B2BApplicationEmail({
  applicationId,
  companyName,
  ico,
  dic,
  icDph,
  contactName,
  contactEmail,
  contactPhone,
  billingAddress,
  message,
  logoUrl,
}: B2BApplicationEmailData) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Nová B2B žiadosť od {companyName}</Preview>
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
              <Text className={EMAIL_HEADING_CLASS}>Nová B2B žiadosť</Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 space-y-3`}>
              <Text className={EMAIL_SUBTITLE_CLASS}>
                Informácie o spoločnosti
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Názov spoločnosti:
                </strong>{" "}
                {companyName}
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">IČO:</strong>{" "}
                {ico}
              </Text>
              {dic && (
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">DIČ:</strong>{" "}
                  {dic}
                </Text>
              )}
              {icDph && (
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">
                    IČ DPH:
                  </strong>{" "}
                  {icDph}
                </Text>
              )}
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
              <Text className={EMAIL_SUBTITLE_CLASS}>Kontaktné informácie</Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Meno a priezvisko:
                </strong>{" "}
                {contactName}
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">Email:</strong>{" "}
                <Link
                  className="text-gray-900 underline"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </Link>
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Telefónne číslo:
                </strong>{" "}
                <Link
                  className="text-gray-900 underline"
                  href={`tel:${contactPhone}`}
                >
                  {contactPhone}
                </Link>
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
              <Text className={EMAIL_SUBTITLE_CLASS}>Fakturačná adresa</Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                {formatAddress(billingAddress)}
              </Text>
            </Section>

            {message && (
              <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
                <Text className={EMAIL_SUBTITLE_CLASS}>Správa</Text>
                <Text className={EMAIL_PARAGRAPH_CLASS}>{message}</Text>
              </Section>
            )}

            <Section className="mt-8 border-gray-200 border-t pt-6 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Táto žiadosť bola odoslaná cez B2B registračný formulár na
                webovej stránke.
              </Text>
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-2`}>
                ID žiadosti: {applicationId}
              </Text>
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-2`}>
                Odpovedať môžete priamo na email{" "}
                <Link
                  className="text-gray-700 underline"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/**
 * Helper that renders the B2B application email template.
 */
export async function renderB2BApplicationEmail(data: B2BApplicationEmailData) {
  return await render(<B2BApplicationEmail {...data} />);
}
