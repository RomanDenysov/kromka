import { Button, Img, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_HEADING_CLASS,
  EMAIL_PARAGRAPH_CLASS,
} from "./shared";

interface B2bApplicationApprovedEmailData {
  companyName: string;
  logoUrl?: string;
  signInUrl: string;
}

/**
 * Notification sent to the applicant when their B2B application is approved.
 * Directs them to sign in with the email they applied with to access their
 * newly created B2B account.
 */
export function B2bApplicationApprovedEmail({
  companyName,
  signInUrl,
  logoUrl,
}: B2bApplicationApprovedEmailData) {
  return (
    <EmailLayout preview="Vaša B2B žiadosť bola schválená - Kromka">
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="96"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="96"
        />
        <Text className={EMAIL_HEADING_CLASS}>
          Vaša žiadosť bola schválená! 🎉
        </Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Dobrá správa - vašu B2B žiadosť pre spoločnosť{" "}
          <strong>{companyName}</strong> sme schválili a vytvorili vám B2B účet.
        </Text>
      </Section>

      <Section className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5 text-center text-gray-700 leading-6">
        <Text className="font-semibold text-gray-900 text-sm">Čo ďalej?</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          Prihláste sa pomocou emailovej adresy, na ktorú vám prišiel tento
          email, a získate prístup k svojmu B2B účtu.
        </Text>
        <Button
          className="mt-4 rounded-md bg-gray-800 px-[20px] py-[12px] text-center text-sm text-white"
          href={signInUrl}
        >
          Prihlásiť sa
        </Button>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the B2B application approved email template.
 */
export async function renderB2bApplicationApprovedEmail(
  data: B2bApplicationApprovedEmailData
) {
  return await render(<B2bApplicationApprovedEmail {...data} />);
}
