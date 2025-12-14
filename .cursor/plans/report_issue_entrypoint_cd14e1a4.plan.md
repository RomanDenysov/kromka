---
name: Report issue entrypoint
overview: Add a “Report an issue” entrypoint in the footer and checkout flow that routes users to the existing support form, prefilled with contextual metadata (page URL, checkout state) and sends a structured email to staff.
todos:
  - id: footer-entrypoint
    content: Add footer link to /kontakt/podpora with ref=context query params.
    status: pending
  - id: checkout-entrypoint
    content: Add checkout UI button(s), including inside the no-dates alert, linking to /kontakt/podpora with appropriate ref and prefilled rootCause.
    status: pending
  - id: prefill-support-form
    content: Read query params on support page/form and prefill fields; include hidden context fields in submission.
    status: pending
  - id: extend-validation
    content: Extend supportRequestSchema to accept optional context fields with max length constraints.
    status: pending
  - id: email-template-context
    content: Update support-request email template + sendEmail payload to include the new context fields.
    status: pending
  - id: server-action-pass-through
    content: Update submitSupportRequest to validate and pass through optional context fields; keep existing behavior unchanged.
    status: pending
  - id: verify-flow
    content: Manually verify navigation + emails + no regressions in Kontakt/Podpora pages.
    status: pending
---

# Report an Issue button + contextual support reports

## Goal

Provide an easy way for users to report problems, without adding a new DB entity, by reusing your existing support form (`/kontakt/podpora`) and email pipeline, while automatically attaching useful context (where the user was, what they were doing).

## UX placement (per your choice)

- **Footer (global link)**: add a link/button “Nahlásiť problém” that routes to `/kontakt/podpora` with prefilled context.
- Target: [`src/components/landing/footer.tsx`](src/components/landing/footer.tsx)
- **Checkout (contextual CTA)**:
- Add a small secondary/outline button in the checkout UI that says “Nahlásiť problém”, linking to `/kontakt/podpora` and passing checkout context.
- Add an additional CTA inside the destructive alert shown when checkout has no available dates.
- Target: [`src/app/(public)/pokladna/checkout-form.tsx`](src/app/\(public)/pokladna/checkout-form.tsx)

## Data captured (email-only)

Reuse existing fields and add **optional context fields** (no schema breakage for existing users):

- **Existing**: `name`, `email`, `rootCause`, `message` (already validated by `supportRequestSchema`)
- **New optional**:
- `sourcePath` (e.g. `/pokladna`)
- `sourceUrl` (full URL if you can construct it)
- `sourceRef` (e.g. `checkout_no_dates`, `checkout_general`, `footer`)
- `cartSummary` (optional: count/items total; only if easily available and non-sensitive)
- `userAgent` (optional; captured client-side)

Implementation detail: extend validation in [`src/validation/contact.ts`](src/validation/contact.ts) so these fields are optional strings with sane max lengths; keep required fields required.

## Prefill behavior

- When user clicks “Nahlásiť problém”, send them to `/kontakt/podpora` with query params like:
- `?ref=checkout_no_dates&path=/pokladna&rootCause=...`
- On the support page, read query params and:
- Pre-fill `rootCause` and/or `message` default text
- Store hidden context fields in the form submission

Targets:

- Support page: [`src/app/(public)/kontakt/podpora/page.tsx`](src/app/\(public)/kontakt/podpora/page.tsx)
- Support form: [`src/components/forms/support-form.tsx`](src/components/forms/support-form.tsx)

## Email content updates

Include the optional context fields in the staff email template so you get actionable reports.

Targets:

- Staff email template: [`src/lib/email/templates/support-request.tsx`](src/lib/email/templates/support-request.tsx)
- Email sender: [`src/lib/email/index.ts`](src/lib/email/index.ts) (extend `sendEmail.supportRequest` payload shape)
- Server action: [`src/lib/actions/contact.ts`](src/lib/actions/contact.ts) (pass through validated optional context)

## Safety / privacy

- Do **not** include sensitive data (payment details, addresses beyond what user typed, etc.).
- Truncate long fields and sanitize/escape anything rendered in email.
- (Optional “complex” hardening) Add lightweight spam protection:
- honeypot field in form, or
- simple per-IP rate limiting at the server action boundary (implementation depends on your infra).

## Test plan

- Click footer “Nahlásiť problém” → support form opens with prefilled values.
- Trigger checkout “no available dates” alert → CTA opens support form with `ref=checkout_no_dates`.
- Submit form → staff receives email containing:
- user-entered info
- `ref/path/url/userAgent` context
- Confirm user confirmation email still sends.

## DB-backed tickets (deferred)

If later you want a full ticket system, add a `support_requests` table + admin view; with the above design, you can keep the UI and just change the backend from “email only” to “persist + email”.