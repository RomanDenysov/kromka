import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import {
  DEFAULT_CONTACT_PHONES,
  DEFAULT_SUPPORT_EMAIL,
  EMAIL_BODY_CLASS,
  EMAIL_CONTAINER_CLASS,
  EMAIL_MUTED_TEXT_CLASS,
  getCopyrightText,
} from "./shared";

export function EmailFooter() {
  return (
    <Section className="mt-6 border-gray-200 border-t pt-4 text-center">
      <Text className={EMAIL_MUTED_TEXT_CLASS}>
        {"Máte otázky? Napíšte nám na "}
        <Link
          className="text-gray-700 underline"
          href={`mailto:${DEFAULT_SUPPORT_EMAIL}`}
        >
          {DEFAULT_SUPPORT_EMAIL}
        </Link>
      </Text>
      <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-1`}>
        {DEFAULT_CONTACT_PHONES.map((contact, idx) => (
          <span key={contact.phone}>
            {idx > 0 && " · "}
            <Link
              className="text-gray-700 underline"
              href={`tel:${contact.phone}`}
            >
              {contact.label}
            </Link>
          </span>
        ))}
      </Text>
      <Text className={`${EMAIL_MUTED_TEXT_CLASS} mt-3`}>
        {getCopyrightText()}
      </Text>
    </Section>
  );
}

interface EmailLayoutProps {
  children: ReactNode;
  noFooter?: boolean;
  preview: string;
}

export function EmailLayout({ preview, children, noFooter }: EmailLayoutProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{preview}</Preview>
        <Body className={EMAIL_BODY_CLASS}>
          <Container className={EMAIL_CONTAINER_CLASS}>
            {children}
            {!noFooter && <EmailFooter />}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
