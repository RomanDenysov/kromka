import { Img, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_CARD_CLASS,
  EMAIL_HEADING_CLASS,
} from "./shared";

export interface ThankYouEmailData {
  logoUrl?: string;
}

/**
 * Friendly thank-you message after the order lifecycle is completed.
 */
export function ThankYouEmail({ logoUrl }: ThankYouEmailData) {
  return (
    <EmailLayout preview="Ďakujeme za vašu objednávku - Kromka">
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="80"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="80"
        />
        <Text className={EMAIL_HEADING_CLASS}>
          Ďakujeme, že máte radi naše lakocinky!
        </Text>
      </Section>

      <Section className={`${EMAIL_CARD_CLASS} mt-6 text-center`}>
        <Text className="text-base text-gray-800">
          Tešíme sa na vás aj nabudúce. Zatiaľ si nás môžete pozrieť na našich
          sociálnych sieťach alebo sa zastavte na kávičku.
        </Text>
        <Text className="mt-4 text-base text-gray-900 italic">
          Váš tím pekárne Kromka 👋🏻
        </Text>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the thank-you email template.
 */
export async function renderThankYouEmail(data: ThankYouEmailData) {
  return await render(<ThankYouEmail {...data} />);
}
