# B2B API Actions Reference

Server actions for B2B functionality.

## Applications

### `submitB2bApplication`

Submit a new B2B partnership application.

**Location**: `src/features/b2b/applications/actions.ts`

**Input**:
```typescript
{
  companyName: string;
  ico: string;
  dic?: string;
  icDph?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: Address;
  message?: string;
}
```

**Output**:
```typescript
{ success: true } | { success: false; error: string }
```

**Behavior**:
- Validates input with Zod schema
- Inserts into `b2b_applications` table with status "pending"
- Sends email notification to admin staff
- Returns success/error result

---

### `getB2bApplications`

Fetch B2B applications with optional filters.

**Location**: `src/features/b2b/applications/queries.ts`

**Input**:
```typescript
{
  status?: B2bApplicationStatus;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
```

**Output**: `B2bApplication[]` with relations (reviewedBy, etc.)

---

### `approveB2bApplication`

Approve a B2B application and create organization.

**Location**: `src/features/b2b/applications/actions.ts`

**Input**:
```typescript
{
  applicationId: string;
  priceTierId: string;
}
```

**Output**:
```typescript
{ success: true; organizationId: string } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- Creates organization with billing info from application
- Assigns price tier
- Creates invitation via better-auth API
- Sends invitation email to contact email
- Updates application status to "approved"
- Sets `reviewedAt` and `reviewedBy`

---

### `rejectB2bApplication`

Reject a B2B application.

**Location**: `src/features/b2b/applications/actions.ts`

**Input**:
```typescript
{
  applicationId: string;
  rejectionReason: string;
}
```

**Output**:
```typescript
{ success: true } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- Updates application status to "rejected"
- Sets rejection reason
- Sends rejection email to contact email
- Sets `reviewedAt` and `reviewedBy`

---

## Organizations (Clients)

### `getOrganizations`

Fetch B2B organizations with statistics.

**Location**: `src/features/b2b/clients/queries.ts`

**Input**:
```typescript
{
  search?: string;
  priceTierId?: string;
  limit?: number;
  offset?: number;
}
```

**Output**: `Organization[]` with:
- Order count
- Total revenue
- Price tier info
- Member count

---

### `getOrganizationById`

Fetch single organization with full details.

**Location**: `src/features/b2b/clients/queries.ts`

**Input**: `organizationId: string`

**Output**: `Organization` with:
- Billing info
- Price tier
- Members
- Orders
- Invoices

---

### `updateOrganization`

Update organization billing info and price tier.

**Location**: `src/features/b2b/clients/actions.ts`

**Input**:
```typescript
{
  organizationId: string;
  billingName?: string;
  ico?: string;
  dic?: string;
  icDph?: string;
  billingAddress?: Address;
  billingEmail?: string;
  paymentTermDays?: number;
  priceTierId?: string;
}
```

**Output**:
```typescript
{ success: true } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- Updates organization fields
- Validates price tier exists if provided

---

## Price Tiers

### `getPriceTiers`

Fetch all price tiers with organization count.

**Location**: `src/features/b2b/price-tiers/queries.ts`

**Output**: `PriceTier[]` with:
- Organization count using this tier
- Product count with prices

---

### `getPriceTierById`

Fetch price tier with all product prices.

**Location**: `src/features/b2b/price-tiers/queries.ts`

**Input**: `priceTierId: string`

**Output**: `PriceTier` with:
- All products and their tier prices
- Organizations using this tier

---

### `createPriceTier`

Create new price tier with default prices.

**Location**: `src/features/b2b/price-tiers/actions.ts`

**Input**:
```typescript
{
  name: string;
  description?: string;
}
```

**Output**:
```typescript
{ success: true; priceTierId: string } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- Creates price tier
- Copies base product prices as initial tier prices
- Returns new tier ID

---

### `updatePriceTier`

Update price tier name/description.

**Location**: `src/features/b2b/price-tiers/actions.ts`

**Input**:
```typescript
{
  priceTierId: string;
  name?: string;
  description?: string;
}
```

**Output**:
```typescript
{ success: true } | { success: false; error: string }
```

---

### `updateTierPrices`

Bulk update product prices for a tier.

**Location**: `src/features/b2b/price-tiers/actions.ts`

**Input**:
```typescript
{
  priceTierId: string;
  prices: Array<{
    productId: string;
    priceCents: number;
  }>;
}
```

**Output**:
```typescript
{ success: true; updatedCount: number } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- Upserts prices for products in tier
- Validates priceCents >= 0

---

## Invoices

### `getInvoices`

Fetch invoices with filters.

**Location**: `src/features/b2b/invoices/queries.ts`

**Input**:
```typescript
{
  organizationId?: string;
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
```

**Output**: `Invoice[]` with:
- Organization info
- Linked orders
- Payment status

---

### `getInvoiceById`

Fetch single invoice with full details.

**Location**: `src/features/b2b/invoices/queries.ts`

**Input**: `invoiceId: string`

**Output**: `Invoice` with:
- Organization billing info
- All linked orders with items
- Payment history

---

### `generateInvoiceForCompany`

Generate invoice for organization's unpaid orders in period.

**Location**: `src/lib/actions/invoices.ts` (existing)

**Input**:
```typescript
{
  companyId: string;
  periodStart: Date;
  periodEnd: Date;
}
```

**Output**: `invoiceId: string`

**Behavior**:
- Finds orders with `paymentMethod: "invoice"` and `paymentStatus: "pending"`
- Calculates total
- Generates invoice number (VS-YYYY-NNNN)
- Creates invoice with due date based on payment terms
- Links orders to invoice

---

### `updateInvoiceStatus`

Update invoice status (issued, paid, void).

**Location**: `src/features/b2b/invoices/actions.ts`

**Input**:
```typescript
{
  invoiceId: string;
  status: InvoiceStatus;
  pdfUrl?: string; // Required when marking as issued
}
```

**Output**:
```typescript
{ success: true } | { success: false; error: string }
```

**Behavior**:
- Requires admin authentication
- When marking as paid, updates all linked orders to `paymentStatus: "paid"`
- Sets `issuedAt` when status becomes "issued"
- Sets `paidAt` when status becomes "paid"

---

## Pricing Utilities

### `getEffectivePrice`

Get effective price for product based on user's organization tier.

**Location**: `src/lib/pricing.ts`

**Input**:
```typescript
{
  productId: string;
  basePriceCents: number;
  priceTierId?: string | null;
}
```

**Output**: `number` (price in cents)

**Behavior**:
- If `priceTierId` provided, queries tier price
- Returns tier price if exists, otherwise base price
- Used throughout UI for price display

---

### `getProductsByCatalog`

Fetch products filtered by catalog type (B2B/B2C).

**Location**: `src/features/products/queries.ts`

**Input**:
```typescript
{
  catalog: "b2b" | "b2c";
  priceTierId?: string; // For B2B, overlay tier prices
}
```

**Output**: `Product[]` with:
- Filtered by `showInB2b` or `showInB2c`
- Tier-adjusted `priceCents` if B2B and tier provided

---

### `getCategoriesByCatalog`

Fetch categories filtered by catalog type.

**Location**: `src/features/categories/queries.ts`

**Input**:
```typescript
{
  catalog: "b2b" | "b2c";
}
```

**Output**: `Category[]` filtered by `showInB2b` or `showInB2c`
