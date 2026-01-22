# B2B Section

B2B (Business-to-Business) functionality for Kromka bakery e-commerce platform. This system enables businesses to apply for B2B partnership, receive custom pricing, and place orders with invoice payment terms.

## Overview

The B2B system consists of:

- **Public-facing application flow**: Businesses can apply for B2B partnership through a landing page and application form
- **Admin management**: Review applications, manage organizations, configure price tiers, and handle invoices
- **B2B customer experience**: Separate catalog with tier-based pricing, invoice payment options, and organization-specific order management

## Key Concepts

### Organizations

B2B clients are represented as `organizations` in the database. Each organization has:
- Billing information (ICO, DIČ, IČ DPH, address)
- Payment terms (default 14 days)
- Assigned price tier for custom pricing
- Members (users who can place orders on behalf of the organization)

### Price Tiers

Price tiers allow different pricing for different organizations. Each tier can have custom prices per product, overriding the base product price.

### B2B Applications

Before an organization is created, businesses submit applications through `/b2b/apply`. Applications go through an approval workflow:
1. **Pending**: Initial submission
2. **Approved**: Organization created, invitation sent to contact email
3. **Rejected**: Application declined with optional reason

### Invoices

B2B orders can use "invoice" payment method. Orders are grouped into invoices based on billing periods. Invoices track payment status and link to orders.

## User Journey

### Business Application Flow

1. Business visits `/b2b` landing page
2. Clicks CTA to `/b2b/apply`
3. Fills out application form (company info, contact person, billing address)
4. Submits application → stored in `b2b_applications` table
5. Admin receives email notification
6. Admin reviews application in `/admin/b2b/applications`
7. Admin approves → organization created, invitation sent
8. Contact person receives invitation email
9. User accepts invitation → becomes organization member
10. Member can access `/b2b/shop` and place orders

### B2B Order Flow

1. Organization member logs in
2. Accesses `/b2b/shop` (B2B catalog with tier pricing)
3. Adds products to cart (prices reflect their tier)
4. Proceeds to checkout
5. Selects "Pay by invoice" payment method
6. Places order → `companyId` set, prices stored from tier
7. Order appears in admin with organization attribution
8. Admin generates invoice for billing period
9. Invoice sent to organization
10. Payment received → invoice marked paid, orders updated

## Catalog Separation

- **B2C Catalog** (`/e-shop`): Shows products with `showInB2c: true`, uses base prices
- **B2B Catalog** (`/b2b/shop`): Shows products with `showInB2b: true`, uses tier prices when available

Products and categories can be configured to appear in one or both catalogs via `showInB2b` and `showInB2c` flags.

## Related Documentation

- [Architecture](architecture.md) - System architecture and data flow diagrams
- [API Actions](api-actions.md) - Server actions reference
