import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { formatPrice } from "@/lib/utils";

import {
  DEFAULT_LOGO_URL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  formatOrderCode,
} from "./shared";

type ReceiptProductLine = {
  title: string;
  quantity: number;
  priceCents: number;
};

type FooterLink = {
  label: string;
  url: string;
};

export type ReceiptEmailData = {
  date: string;
  orderId: string | number;
  status: string;
  method: "card" | "cash" | "store" | string;
  products: ReceiptProductLine[];
  pickupPlaceUrl?: string;
  pickupPlace: string;
  pickupDate: string;
  totalCents: number;
  logoUrl?: string;
  footerLinks?: FooterLink[];
};

const paymentLabels: Record<string, string> = {
  card: "Platba kartou",
  cash: "Platba v hotovosti",
  store: "Platba v obchode",
};

/**
 * Detailed receipt customers obtain right after placing an order.
 */
export function ReceiptEmail({
  date,
  orderId,
  status,
  method,
  products,
  pickupPlaceUrl,
  pickupPlace,
  pickupDate,
  totalCents,
  logoUrl,
  footerLinks,
}: ReceiptEmailData) {
  const formattedOrderId = formatOrderCode(orderId);
  const paymentLabel = paymentLabels[method] ?? method;
  const hasFooterLinks = Boolean(footerLinks?.length);

  return (
    <Html>
      <Head />
      <Preview>Objednávka v Pekárni Kromka</Preview>
      <Tailwind>
        <Body className={EMAIL_BODY_CLASS}>
          <Container className={EMAIL_CONTAINER_CLASS}>
            <Section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Img
                alt="Kromka Logo"
                height="52"
                src={logoUrl ?? DEFAULT_LOGO_URL}
                width="120"
              />
              <Text className="font-semibold text-3xl text-gray-800">
                Vaša objednávka
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 space-y-4`}>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Status objednávky
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">
                  {status}
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Spôsob platby
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">
                  {paymentLabel}
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Dátum vytvorenia
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">
                  {date}
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Číslo objednávky
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">
                  {formattedOrderId}
                </Text>
              </div>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Miesto vyzdvihnutia
                </Text>
                {pickupPlaceUrl ? (
                  <Link
                    className="font-semibold text-blue-600 text-sm underline"
                    href={pickupPlaceUrl}
                  >
                    {pickupPlace}
                  </Link>
                ) : (
                  <Text className="font-semibold text-gray-900 text-sm">
                    {pickupPlace}
                  </Text>
                )}
              </div>
              <div>
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Dátum vyzdvihnutia
                </Text>
                <Text className="font-semibold text-gray-900 text-sm">
                  {pickupDate}
                </Text>
              </div>
            </Section>

            <Section className="mt-8">
              <Text className="font-semibold text-base text-gray-900">
                Produkty
              </Text>
              <div className="mt-4 space-y-3">
                {products.map((product) => {
                  const lineTotal = product.priceCents * product.quantity;
                  return (
                    <div
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                      key={product.title}
                    >
                      <Text className="font-semibold text-gray-900 text-sm">
                        {product.title} × {product.quantity} ks
                      </Text>
                      <Text className="font-semibold text-gray-900 text-sm">
                        {formatPrice(lineTotal)}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Hr className="my-6 border-gray-200" />

            <Section className="flex items-center justify-between">
              <Text className="font-semibold text-gray-500 text-xs uppercase">
                Spolu
              </Text>
              <Text className="font-semibold text-2xl text-gray-900">
                {formatPrice(totalCents)}
              </Text>
            </Section>

            {hasFooterLinks ? (
              <Section className="mt-8 text-center">
                <Text className="font-semibold text-gray-500 text-xs uppercase">
                  Užitočné odkazy
                </Text>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
                  {footerLinks?.map((link) => (
                    <Link
                      className="text-blue-600 underline"
                      href={link.url}
                      key={link.url}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </Section>
            ) : null}

            <Section className="mt-8 text-center">
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                Ak máte otázky k objednávke, odpovedzte priamo na tento email
                alebo nás kontaktujte na predajni.
              </Text>
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
 * Helper that renders the receipt email template.
 */
export async function renderReceiptEmail(data: ReceiptEmailData) {
  return await render(<ReceiptEmail {...data} />);
}
