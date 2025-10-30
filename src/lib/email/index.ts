import { createTransport } from "nodemailer";
import { env } from "@/env";
import { renderMagicLink } from "./templates/magic-link";

const config = {
  host: env.EMAIL_HOST,
  port: 587,
  secure: false,
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
};
