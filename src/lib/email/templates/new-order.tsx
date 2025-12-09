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
  orderNumber: string | number;
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

  return (
    <Html>
      <Head />
      <Preview>
        Nová objednávka {formattedOrderId} – {pickupPlace}
      </Preview>
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
              <Text className={EMAIL_SUBTITLE_CLASS}>Detaily objednávky</Text>
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
              <Text className={EMAIL_PARAGRAPH_CLASS}>
                <strong className="font-semibold text-gray-900">
                  ID v systéme:
                </strong>{" "}
                {formattedOrderId}
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
                <div className="mt-3 space-y-2">
                  {products.map((product) => (
                    <Text
                      className="font-medium text-gray-800 text-sm"
                      key={product.title}
                    >
                      • {product.title} – {product.quantity} ks{" "}
                      <span className="text-gray-500 text-xs">x</span>{" "}
                      {formatPrice(product.priceCents)} ={" "}
                      {formatPrice(product.priceCents * product.quantity)}
                    </Text>
                  ))}
                </div>
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
