import { Img, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_HEADING_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

interface SupportConfirmationEmailData {
  logoUrl?: string;
}

/**
 * Confirmation email sent to user after they submit a support request.
 */
export function SupportConfirmationEmail({
  logoUrl,
}: SupportConfirmationEmailData) {
  return (
    <EmailLayout preview="Vaša žiadosť o podporu bola prijatá - Kromka">
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="96"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="96"
        />
        <Text className={EMAIL_HEADING_CLASS}>Ďakujeme za vašu správu! ✅</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Vaša žiadosť o podporu bola úspešne prijatá a náš tím sa vám čo
          najskôr ozve.
        </Text>
      </Section>

      <Section className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5 text-gray-700 leading-6">
        <Text className="font-semibold text-gray-900 text-sm">Čo ďalej?</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Náš tím podpory prešiel vašu správu a pracuje na jej vyriešení.
          Odošleme vám odpoveď na emailovú adresu, ktorú ste poskytli.
        </Text>
        <Text className={`${EMAIL_PARAGRAPH_CLASS} mt-3`}>
          Očakávaná doba odozvy je do 24 hodín v pracovných dňoch.
        </Text>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the support confirmation email template.
 */
export async function renderSupportConfirmationEmail(
  data: SupportConfirmationEmailData
) {
  return await render(<SupportConfirmationEmail {...data} />);
}
