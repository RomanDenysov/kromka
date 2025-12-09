import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { formatPrice } from "@/lib/utils";
import {
  DEFAULT_LOGO_URL,
  DEFAULT_SUPPORT_EMAIL,
  EMAIL_BODY_CLASS,
  EMAIL_CARD_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  EMAIL_SUBTITLE_CLASS,
  formatOrderCode,
} from "./shared";

type OrderSummaryProduct = {
  title: string;
  quantity: number;
  priceCents: number;
};

type CustomerDetails = {
  name: string;
  email: string;
  phone?: string | null;
};

export type NewOrderEmailData = {
  orderId: string;
  orderNumber: string | number;
  orderUrl: string;
  pickupPlace: string;
  pickupPlaceUrl?: string;
  pickupTime: string;
  pickupDate: string;
  paymentMethod: "in_store" | "card" | "invoice" | "other";
  products: OrderSummaryProduct[];
  customer: CustomerDetails;
  supportEmail?: string;
  logoUrl?: string;
};

const labels: Record<string, string> = {
  in_store: "Na predajni",
  invoice: "Na faktúru",
  card: "Kartou",
  other: "Iné",
};

/**
 * Transactional template sent to admins with the core order details.
 */
export function NewOrderEmail({
  orderNumber,
  orderUrl,
  pickupPlace,
  pickupPlaceUrl,
  pickupTime,
  pickupDate,
  paymentMethod,
  products,
  customer,
  supportEmail,
  logoUrl,
}: NewOrderEmailData) {
  const formattedOrderId = formatOrderCode(orderNumber);
  const paymentLabel = labels[paymentMethod] ?? paymentMethod;
  const contactEmail = supportEmail ?? DEFAULT_SUPPORT_EMAIL;
  const hasProducts = products.length > 0;
  const totalCents = products.reduce(
    (sum, p) => sum + p.priceCents * p.quantity,
    0
  );

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>
          Nová objednávka {formattedOrderId} – {pickupPlace}
        </Preview>
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
                Nová objednávka {formattedOrderId}
              </Text>
              <Text className="font-medium text-base text-gray-600">
                Predajňa:{" "}
                <Link
                  className="text-gray-900 underline"
                  href={pickupPlaceUrl ?? "#"}
                >
                  {pickupPlace}
                </Link>
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-6 space-y-3`}>
              <Row>
                <Text className={`${EMAIL_SUBTITLE_CLASS} inline`}>
                  Detaily objednávky
                </Text>
                <code className="ml-2 rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 text-xs">
                  {formattedOrderId}
                </code>
              </Row>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Dátum a čas vyzdvihnutia:
                </strong>{" "}
                {pickupDate} {pickupTime}
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  Spôsob platby:
                </strong>{" "}
                {paymentLabel}
              </Text>
            </Section>

            <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-2`}>
              <Text className={EMAIL_SUBTITLE_CLASS}>
                Informácie o zákazníkovi
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">Meno:</strong>{" "}
                {customer.name}
              </Text>
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">Email:</strong>{" "}
                <Link
                  className="text-gray-900 underline"
                  href={`mailto:${customer.email}`}
                >
                  {customer.email}
                </Link>
              </Text>
              {customer.phone ? (
                <Text className={EMAIL_PARAGRAPH_CLASS}>
                  <strong className="font-semibold text-gray-900">
                    Telefón:
                  </strong>{" "}
                  <Link
                    className="text-gray-900 underline"
                    href={`tel:${customer.phone}`}
                  >
                    {customer.phone}
                  </Link>
                </Text>
              ) : null}
            </Section>

            {hasProducts ? (
              <Section className={`${EMAIL_CARD_CLASS} mt-4`}>
                <Text className={EMAIL_SUBTITLE_CLASS}>Produkty</Text>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  className="mt-3 w-full text-left text-sm"
                >
                  <thead>
                    <tr className="border-gray-200 border-b">
                      <th className="pb-2 font-semibold text-gray-500 text-xs">
                        Produkt
                      </th>
                      <th className="pb-2 text-center font-semibold text-gray-500 text-xs">
                        Ks
                      </th>
                      <th className="pb-2 text-right font-semibold text-gray-500 text-xs">
                        Cena/ks
                      </th>
                      <th className="pb-2 text-right font-semibold text-gray-500 text-xs">
                        Spolu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        className="border-gray-100 border-b"
                        key={product.title}
                      >
                        <td className="py-2 font-medium text-gray-900">
                          {product.title}
                        </td>
                        <td className="py-2 text-center text-gray-700">
                          {product.quantity}
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {formatPrice(product.priceCents)}
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
                        colSpan={3}
                      >
                        Celkom
                      </td>
                      <td className="pt-3 text-right font-bold text-gray-900">
                        {formatPrice(totalCents)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <Link
                  className="mt-4 inline-block rounded-md bg-gray-800 px-4 py-2 font-medium text-sm text-white"
                  href={orderUrl}
                >
                  Zobraziť detaily objednávky
                </Link>
              </Section>
            ) : null}

            <Section className="mt-8 border-gray-200 border-t pt-6 text-center">
              <Text className={EMAIL_MUTED_TEXT_CLASS}>
                Ak ste tento email neočakávali, kontaktujte nás na{" "}
                <Link
                  className="text-gray-900 underline"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/**
 * Helper that renders the New Order template to HTML.
 */
export async function renderNewOrderEmail(data: NewOrderEmailData) {
  return await render(<NewOrderEmail {...data} />);
}
