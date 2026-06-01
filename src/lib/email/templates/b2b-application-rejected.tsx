import { Img, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_HEADING_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

interface B2bApplicationRejectedEmailData {
  companyName: string;
  logoUrl?: string;
  reason?: string | null;
}

/**
 * Notification sent to the applicant when their B2B application is rejected.
 * Includes the optional rejection reason provided by the reviewer.
 */
export function B2bApplicationRejectedEmail({
  companyName,
  reason,
  logoUrl,
}: B2bApplicationRejectedEmailData) {
  return (
    <EmailLayout preview="Stav vašej B2B žiadosti - Kromka">
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="96"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="96"
        />
        <Text className={EMAIL_HEADING_CLASS}>Stav vašej B2B žiadosti</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Ďakujeme za záujem o spoluprácu. Vašu B2B žiadosť pre spoločnosť{" "}
          <strong>{companyName}</strong> sme momentálne nemohli schváliť.
        </Text>
      </Section>

      {reason ? (
        <Section className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5 text-gray-700 leading-6">
          <Text className="font-semibold text-gray-900 text-sm">Dôvod</Text>
          <Text className={EMAIL_PARAGRAPH_CLASS}>{reason}</Text>
        </Section>
      ) : null}

      <Section className="mt-6 text-center">
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Ak máte otázky alebo by ste chceli žiadosť prekonzultovať, neváhajte
          nás kontaktovať.
        </Text>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the B2B application rejected email template.
 */
export async function renderB2bApplicationRejectedEmail(
  data: B2bApplicationRejectedEmailData
) {
  return await render(<B2bApplicationRejectedEmail {...data} />);
}
