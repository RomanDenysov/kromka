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

import { formatPrice } from "@/lib/utils";

import {
  DEFAULT_CONTACT_PHONES,
  DEFAULT_LOGO_URL,
  DEFAULT_SUPPORT_EMAIL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
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
  pickupTime: string;
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
  pickupTime,
  totalCents,
  logoUrl,
  footerLinks,
}: ReceiptEmailData) {
  const formattedOrderId = formatOrderCode(orderId);
  const paymentLabel = paymentLabels[method] ?? method;
  const hasFooterLinks = Boolean(footerLinks?.length);

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Objednávka {formattedOrderId} – Kromka</Preview>
        <Body className={EMAIL_BODY_CLASS}>
          <Container className={EMAIL_CONTAINER_CLASS}>
            <Section className="text-center">
              <Img
                alt="Kromka Logo"
                className="mx-auto mb-2"
                height="64"
                src={logoUrl ?? DEFAULT_LOGO_URL}
                width="64"
              />
              <Text className="font-semibold text-gray-800 text-xl">
                Potvrdenie objednávky
              </Text>
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-xs">
                {formattedOrderId}
              </code>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4`}>
              <table
                cellPadding="0"
                cellSpacing="0"
                className="w-full text-left text-sm"
              >
                <tbody>
                  <tr className="border-gray-100 border-b">
                    <td className="py-2 text-gray-500">Status</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {status}
                    </td>
                  </tr>
                  <tr className="border-gray-100 border-b">
                    <td className="py-2 text-gray-500">Platba</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {paymentLabel}
                    </td>
                  </tr>
                  <tr className="border-gray-100 border-b">
                    <td className="py-2 text-gray-500">Vytvorené</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {date}
                    </td>
                  </tr>
                  <tr className="border-gray-100 border-b">
                    <td className="py-2 text-gray-500">Predajňa</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {pickupPlaceUrl ? (
                        <Link
                          className="text-blue-600 underline"
                          href={pickupPlaceUrl}
                        >
                          {pickupPlace}
                        </Link>
                      ) : (
                        pickupPlace
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Vyzdvihnutie</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {pickupDate}, {pickupTime}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4`}>
              <Text className="mb-2 font-semibold text-gray-900 text-sm">
                Produkty
              </Text>
              <table
                cellPadding="0"
                cellSpacing="0"
                className="w-full text-left text-sm"
              >
                <thead>
                  <tr className="border-gray-200 border-b">
                    <th className="pb-2 font-medium text-gray-500 text-xs">
                      Produkt
                    </th>
                    <th className="pb-2 text-center font-medium text-gray-500 text-xs">
                      Ks
                    </th>
                    <th className="pb-2 text-right font-medium text-gray-500 text-xs">
                      Cena
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      className="border-gray-100 border-b"
                      key={product.title}
                    >
                      <td className="py-2 text-gray-900">{product.title}</td>
                      <td className="py-2 text-center text-gray-700">
                        {product.quantity}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {formatPrice(product.priceCents * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      className="pt-3 font-semibold text-gray-900"
                      colSpan={2}
                    >
                      SPOLU
                    </td>
                    <td className="pt-3 text-right font-bold text-gray-900">
                      {formatPrice(totalCents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Section>

            {hasFooterLinks ? (
              <Section className="mt-6 text-center">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
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
                © 2025 Kromka s.r.o.
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
