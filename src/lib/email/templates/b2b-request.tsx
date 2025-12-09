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
  DEFAULT_LOGO_URL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  EMAIL_SUBTITLE_CLASS,
} from "./shared";

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Reštaurácia",
  hotel: "Hotel",
  cafe: "Kaviareň",
  shop: "Obchod",
  other: "Iné",
};

type B2BRequestEmailData = {
  companyName: string;
  businessType: string;
  userName: string;
  email: string;
  phone: string;
  logoUrl?: string;
};

/**
 * Email template sent to staff when a B2B request is submitted.
 */
export function B2BRequestEmail({
  companyName,
  businessType,
  userName,
  email,
  phone,
  logoUrl,
}: B2BRequestEmailData) {
  const businessTypeLabel = BUSINESS_TYPE_LABELS[businessType] ?? businessType;

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
                <strong className="font-semibold text-gray-900">
                  Typ podniku:
                </strong>{" "}
                {businessTypeLabel}
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
              <Text className={EMAIL_SUBTITLE_CLASS}>Kontaktné informácie</Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Meno a priezvisko:
                </strong>{" "}
                {userName}
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">Email:</strong>{" "}
                <Link
                  className="text-gray-900 underline"
                  href={`mailto:${email}`}
                >
                  {email}
                </Link>
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Telefónne číslo:
                </strong>{" "}
                <Link className="text-gray-900 underline" href={`tel:${phone}`}>
                  {phone}
                </Link>
              </Text>
            </Section>

            <Section className="mt-8 border-gray-200 border-t pt-6 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Táto žiadosť bola odoslaná cez B2B registračný formulár na
                webovej stránke.
              </Text>
              <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-2`}>
                Odpovedať môžete priamo na email{" "}
                <Link
                  className="text-gray-700 underline"
                  href={`mailto:${email}`}
                >
                  {email}
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
 * Helper that renders the B2B request email template.
 */
export async function renderB2BRequestEmail(data: B2BRequestEmailData) {
  return await render(<B2BRequestEmail {...data} />);
}
