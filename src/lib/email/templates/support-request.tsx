import { Img, Link, render, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import {
  DEFAULT_LOGO_URL,
  EMAIL_CARD_CLASS,
  EMAIL_HEADING_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  EMAIL_PARAGRAPH_CLASS,
  EMAIL_SUBTITLE_CLASS,
} from "./shared";

interface SupportRequestEmailData {
  email: string;
  logoUrl?: string;
  message: string;
  name: string;
  posthogId?: string;
  rootCause: string;
  sourcePath?: string;
  sourceRef?: string;
  sourceUrl?: string;
  userAgent?: string;
}

export function SupportRequestEmail({
  name,
  email,
  rootCause,
  message,
  logoUrl,
  sourcePath,
  sourceUrl,
  sourceRef,
  userAgent,
  posthogId,
}: SupportRequestEmailData) {
  return (
    <EmailLayout noFooter preview={`Nová žiadosť o podporu od ${name}`}>
      <Section className="text-center">
        <Img
          alt="Kromka Logo"
          className="mx-auto mb-4"
          height="96"
          src={logoUrl ?? DEFAULT_LOGO_URL}
          width="96"
        />
        <Text className={EMAIL_HEADING_CLASS}>Nová žiadosť o podporu</Text>
      </Section>

      <Section className={`${EMAIL_CARD_CLASS} mt-6 space-y-3`}>
        <Text className={EMAIL_SUBTITLE_CLASS}>Informácie o zákazníkovi</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          <strong className="font-semibold text-gray-900">Meno:</strong> {name}
        </Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          <strong className="font-semibold text-gray-900">Email:</strong>{" "}
          <Link className="text-gray-900 underline" href={`mailto:${email}`}>
            {email}
          </Link>
        </Text>
      </Section>

      <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
        <Text className={EMAIL_SUBTITLE_CLASS}>Detaily žiadosti</Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          <strong className="font-semibold text-gray-900">
            Príčina problému:
          </strong>{" "}
          {rootCause}
        </Text>
        <Text className={EMAIL_PARAGRAPH_CLASS}>
          <strong className="font-semibold text-gray-900">Vysvetlenie:</strong>
        </Text>
        <Text className="whitespace-pre-wrap text-gray-700 text-sm leading-6">
          {message}
        </Text>
      </Section>

      {(sourcePath || sourceUrl || sourceRef || userAgent || posthogId) && (
        <Section className={`${EMAIL_CARD_CLASS} mt-4 space-y-3`}>
          <Text className={EMAIL_SUBTITLE_CLASS}>Kontext</Text>
          {sourceRef && (
            <Text className={EMAIL_PARAGRAPH_CLASS}>
              <strong className="font-semibold text-gray-900">Zdroj:</strong>{" "}
              {sourceRef}
            </Text>
          )}
          {sourcePath && (
            <Text className={EMAIL_PARAGRAPH_CLASS}>
              <strong className="font-semibold text-gray-900">Cesta:</strong>{" "}
              {sourcePath}
            </Text>
          )}
          {sourceUrl && (
            <Text className={EMAIL_PARAGRAPH_CLASS}>
              <strong className="font-semibold text-gray-900">URL:</strong>{" "}
              <Link
                className="break-all text-gray-900 underline"
                href={sourceUrl}
              >
                {sourceUrl}
              </Link>
            </Text>
          )}
          {posthogId && (
            <Text className={EMAIL_PARAGRAPH_CLASS}>
              <strong className="font-semibold text-gray-900">
                PostHog ID:
              </strong>{" "}
              {posthogId}
            </Text>
          )}
          {userAgent && (
            <Text className={EMAIL_PARAGRAPH_CLASS}>
              <strong className="font-semibold text-gray-900">
                Prehliadač:
              </strong>{" "}
              <span className="break-all text-gray-700 text-xs">
                {userAgent}
              </span>
            </Text>
          )}
        </Section>
      )}

      <Section className="mt-8 border-gray-200 border-t pt-6 text-center">
        <Text className={EMAIL_MUTED_TEXT_CLASS}>
          Táto správa bola odoslaná cez kontaktný formulár na webovej stránke.
        </Text>
        <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-2`}>
          Odpovedať môžete priamo na email{" "}
          <Link className="text-gray-700 underline" href={`mailto:${email}`}>
            {email}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}

/**
 * Helper that renders the support request email template.
 */
export async function renderSupportRequestEmail(data: SupportRequestEmailData) {
  return await render(<SupportRequestEmail {...data} />);
}
