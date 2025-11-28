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
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

export type OrderReadyEmailData = {
  pickupPlace: string;
  logoUrl?: string;
};

/**
 * Notifies the customer that their order is ready for pickup.
 */
export function OrderReadyEmail({ pickupPlace, logoUrl }: OrderReadyEmailData) {
  return (
    <Html>
      <Head />
      <Preview>Vaše lakocinky sú nachystané, príďte do Kromky!</Preview>
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
                Vaše lakocinky sú nachystané!
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Tešíme sa na vašu návštevu. Objednávka na vás počká na našej
                predajni{" "}
                <strong className="font-semibold text-gray-900">
                  {pickupPlace}
                </strong>
                .
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
              <Text className="font-semibold text-base text-gray-900">
                Ďakujeme, že máte radi chlieb, lakocinky a kávu tak ako my!
              </Text>
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Po vyzdvihnutí objednávky nám môžete dať vedieť, ako vám
                chutilo.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/**
 * Helper that renders the order-ready email template.
 */
export async function renderOrderReadyEmail(data: OrderReadyEmailData) {
  return await render(<OrderReadyEmail {...data} />);
}
