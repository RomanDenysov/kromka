import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { createTransport } from "nodemailer";
import { env } from "@/env";
import type { Order } from "../queries/orders";
import { renderMagicLink } from "./templates/magic-link";
import { renderNewOrderEmail } from "./templates/new-order";
import { DEFAULT_SUPPORT_EMAIL, getBaseUrl } from "./templates/shared";

const config = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
};

const transporter = createTransport(config);

export async function emailService(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  return await transporter.sendMail(options);
}

export const sendEmail = {
  magicLink: async ({ email, url }: { email: string; url: string }) => {
    const magicLinkTemplate = await renderMagicLink(url);
    return await emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: email,
      subject: "Prihlásenie do Kromka učtu",
      html: magicLinkTemplate,
    });
  },
  newOrder: async ({ order }: { order: Order }) => {
    if (!order) {
      throw new Error("Order not found");
    }

    const customerEmail = order.createdBy?.email ?? order.customerInfo?.email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }
    const pickupDate = order?.pickupDate
      ? format(order.pickupDate, "d. MMMM yyyy", {
          locale: sk,
        })
      : "Neurčený dátum";
    const pickupTime = order?.pickupTime ?? "Neurčený čas";

    const customerInfo = {
      name: order.createdBy?.name ?? order.customerInfo?.name ?? "Neurčené",
      email:
        order.createdBy?.email ?? order.customerInfo?.email ?? "Neurčený email",
      phone:
        order.createdBy?.phone ??
        order.customerInfo?.phone ??
        "Neurčený telefón",
    };

    const pickupPlaceUrl = order.store?.slug
      ? `${getBaseUrl()}/predajne/${order.store.slug}`
      : undefined;

    const orderData = {
      orderNumber: order.orderNumber,
      pickupPlace: order.store?.name ?? "Neurčené",
      pickupPlaceUrl,
      pickupTime,
      pickupDate,
      paymentMethod: order.paymentMethod,
      products: order.items.map((item) => ({
        title: item.product.name,
        quantity: item.quantity,
        priceCents: item.price,
      })),
      customer: customerInfo,
      // TODO: Add support email and logo url
      supportEmail: DEFAULT_SUPPORT_EMAIL,
      logoUrl: "logo-kromka.png",
    };

    const newOrderTemplate = await renderNewOrderEmail(orderData);

    return await emailService({
      from: `"Kromka" <${env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Nová objednávka",
      html: newOrderTemplate,
    });
  },
};
