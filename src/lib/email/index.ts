import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { createTransport } from "nodemailer";
import { env } from "@/env";
import type { Order } from "../queries/orders";
import { renderB2BRequestEmail } from "./templates/b2b-request";
import { renderMagicLink } from "./templates/magic-link";
import { renderNewOrderEmail } from "./templates/new-order";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";
import { renderOrderReadyEmail } from "./templates/order-ready";
import { renderOutOfStockEmail } from "./templates/out-of-stock";
import { renderReceiptEmail } from "./templates/receipt";
import {
  DEFAULT_LOGO_URL,
  DEFAULT_SIGNATURE_LOGO_URL,
  DEFAULT_SUPPORT_EMAIL,
  getBaseUrl,
} from "./templates/shared";
import { renderSupportConfirmationEmail } from "./templates/support-confirmation";
import { renderSupportRequestEmail } from "./templates/support-request";
import { renderThankYouEmail } from "./templates/thank-you";

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Nová",
  confirmed: "Potvrdená",
  preparing: "Pripravuje sa",
  ready: "Pripravená",
  completed: "Dokončená",
  cancelled: "Zrušená",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  in_store: "store",
  card: "card",
  invoice: "store",
  cash: "cash",
};

const config = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
};

const STAFF_EMAIL = ["kromka@kavejo.sk", "r.denysov96@gmail.com"];

const DEVELOPER_EMAIL = "r.denysov96@gmail.com";
const transporter = createTransport(config);

async function emailService(options: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return await transporter.sendMail(options);
}

/** Extracts customer email from order (user or customerInfo fallback) */
function getCustomerEmail(order: Order): string {
  const email = order?.createdBy?.email ?? order?.customerInfo?.email;
  if (!email) {
    throw new Error("Customer email not found");
  }
  return email;
}

/** Builds pickup place URL from store slug */
function getPickupPlaceUrl(storeSlug?: string | null): string | undefined {
  return storeSlug ? `${getBaseUrl()}/predajne/${storeSlug}` : undefined;
}

/** Formats pickup date in Slovak locale */
function formatPickupDate(date: string | null | undefined): string {
  return date ? format(date, "d. MMMM yyyy", { locale: sk }) : "Neurčený dátum";
}

/** Formats order creation date */
function formatOrderDate(date: Date | null | undefined): string {
  return date
    ? format(date, "d. MMMM yyyy, HH:mm", { locale: sk })
    : "Neurčený dátum";
}

export const sendEmail = {
  /**
   * Send magic link for passwordless authentication.
   */
  magicLink: async ({ email, url }: { email: string; url: string }) => {
    const html = await renderMagicLink(url);
    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Prihlásenie do Kromka účtu",
      html,
    });
  },

  /**
   * Send new order notification to staff.
   */
  newOrder: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = getCustomerEmail(order);
    const pickupDate = formatPickupDate(order.pickupDate);
    const pickupTime = order.pickupTime ?? "Neurčený čas";

    const html = await renderNewOrderEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderUrl: `${getBaseUrl()}/admin/orders/${order.id}`,
      pickupPlace: order.store?.name ?? "Neurčené",
      pickupPlaceUrl: getPickupPlaceUrl(order.store?.slug),
      pickupTime,
      pickupDate,
      paymentMethod: order.paymentMethod,
      products: order.items.map((item) => ({
        title: item.product.name,
        quantity: item.quantity,
        priceCents: item.price,
      })),
      customer: {
        name: order.createdBy?.name ?? order.customerInfo?.name ?? "Neurčené",
        email: customerEmail,
        phone: order.createdBy?.phone ?? order.customerInfo?.phone,
      },
      supportEmail: DEFAULT_SUPPORT_EMAIL,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: STAFF_EMAIL,
      subject: `Nová objednávka ${order.orderNumber}`,
      html,
    });
  },

  /**
   * Send order confirmation to customer (order is being prepared).
   */
  orderConfirmation: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = getCustomerEmail(order);

    const html = await renderOrderConfirmationEmail({
      pickupPlace: order.store?.name ?? "Neurčené",
      pickupPlaceUrl: getPickupPlaceUrl(order.store?.slug),
      pickupDate: formatPickupDate(order.pickupDate),
      pickupTime: order.pickupTime ?? "Neurčený čas",
      orderId: order.orderNumber,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Potvrdenie objednávky – Kromka",
      html,
    });
  },

  /**
   * Send notification that order is ready for pickup.
   */
  orderReady: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = getCustomerEmail(order);

    const html = await renderOrderReadyEmail({
      pickupPlace: order.store?.name ?? "Neurčené",
      pickupPlaceUrl: getPickupPlaceUrl(order.store?.slug) ?? "",
      logoUrl: DEFAULT_LOGO_URL,
      orderId: order.orderNumber,
      pickupDate: formatPickupDate(order.pickupDate),
      pickupTime: order.pickupTime ?? "Neurčený čas",
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Vaša objednávka je pripravená – Kromka",
      html,
    });
  },

  /**
   * Send receipt/invoice to customer after order completion.
   */
  receipt: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = getCustomerEmail(order);
    const totalCents = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const html = await renderReceiptEmail({
      date: formatOrderDate(order.createdAt),
      orderId: order.orderNumber,
      status: ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus,
      method: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
      products: order.items.map((item) => ({
        title: item.product.name,
        quantity: item.quantity,
        priceCents: item.price,
      })),
      pickupPlace: order.store?.name ?? "Neurčené",
      pickupPlaceUrl: getPickupPlaceUrl(order.store?.slug),
      pickupDate: formatPickupDate(order.pickupDate),
      pickupTime: order.pickupTime ?? "Neurčený čas",
      totalCents,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Potvrdenie objednávky ${order.orderNumber} – Kromka`,
      html,
    });
  },

  /**
   * Send thank you message after order is completed/picked up.
   */
  thankYou: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = getCustomerEmail(order);

    const html = await renderThankYouEmail({
      logoUrl: DEFAULT_LOGO_URL,
      signatureLogoUrl: DEFAULT_SIGNATURE_LOGO_URL,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Ďakujeme za vašu objednávku – Kromka",
      html,
    });
  },

  /**
   * Notify customer about out-of-stock product.
   */
  outOfStock: async ({
    email,
    productName,
  }: {
    email: string;
    productName: string;
  }) => {
    const html = await renderOutOfStockEmail({ productName });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Produkt nie je k dispozícii – Kromka",
      html,
    });
  },

  /**
   * Send support request from contact form to staff.
   */
  supportRequest: async ({
    name,
    email,
    rootCause,
    message,
  }: {
    name: string;
    email: string;
    rootCause: string;
    message: string;
  }) => {
    const html = await renderSupportRequestEmail({
      name,
      email,
      rootCause,
      message,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: DEVELOPER_EMAIL,
      replyTo: email,
      subject: `Nová žiadosť o podporu od ${name}`,
      html,
    });
  },

  /**
   * Send confirmation email to user after they submit a support request.
   */
  supportConfirmation: async ({ email }: { email: string }) => {
    const html = await renderSupportConfirmationEmail({});

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Vaša žiadosť o podporu bola prijatá – Kromka",
      html,
    });
  },

  /**
   * Send B2B request from registration form to staff.
   */
  b2bRequest: async ({
    companyName,
    businessType,
    userName,
    email,
    phone,
  }: {
    companyName: string;
    businessType: string;
    userName: string;
    email: string;
    phone: string;
  }) => {
    const html = await renderB2BRequestEmail({
      companyName,
      businessType,
      userName,
      email,
      phone,
    });

    return emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: STAFF_EMAIL,
      replyTo: email,
      subject: `Nová B2B žiadosť od ${companyName}`,
      html,
    });
  },
};
