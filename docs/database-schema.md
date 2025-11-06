# Database Schema Documentation

This document provides a comprehensive overview of the database schema logic, relationships, and design patterns used in the Kromka project.

## Table of Contents

1. [Overview](#overview)
2. [Core Entities](#core-entities)
3. [Relationships](#relationships)
4. [Enums](#enums)
5. [Design Patterns](#design-patterns)
6. [Schema Validation](#schema-validation)

## Overview

The database schema is built using **Drizzle ORM** with PostgreSQL. The schema follows a modular structure where each entity has its own schema file, and all schemas are exported through a centralized `schemas.ts` file that provides Zod validation schemas derived from the database tables.

### Key Technologies

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon)
- **Validation**: Zod (via drizzle-zod)
- **ID Generation**: Prefixed IDs (e.g., `prod_xxx`, `cat_xxx`)

## Core Entities

### Products

**Table**: `products`

Products are the core entity representing items sold in the system. They support multi-channel sales (B2C/B2B), multiple categories, pricing tiers, and rich media.

**Key Fields**:
- `id`: Prefixed ID (`prod_xxx`)
- `name`: Product name
- `slug`: URL-friendly unique identifier
- `sku`: Stock Keeping Unit (unique)
- `description`: JSONB field for rich content
- `stock`: Integer stock quantity
- `isActive`: Boolean flag for active status
- `sortOrder`: Integer for display ordering
- `status`: Enum (`draft`, `active`, `inactive`, `archived`)
- `archivedAt`: Soft archive timestamp
- `deletedAt`: Soft delete timestamp

**Related Tables**:
- `product_images`: Many-to-many relationship with media
- `product_categories`: Many-to-many relationship with categories
- `product_channels`: Channel availability (B2C/B2B)
- `prices`: Pricing information
- `order_items`: Order line items
- `invoice_items`: Invoice line items

### Categories

**Table**: `categories`

Categories organize products hierarchically and support availability windows for time-based availability.

**Key Fields**:
- `id`: Prefixed ID (`cat_xxx`)
- `name`: Category name
- `slug`: URL-friendly unique identifier
- `description`: Text description
- `isActive`: Boolean flag
- `sortOrder`: Integer for display ordering
- `deletedAt`: Soft delete timestamp

**Related Tables**:
- `category_availability_windows`: Time-based availability periods
- `product_categories`: Junction table for product-category relationships

**Availability Windows**:
Categories can have multiple availability windows defined by `startDate` and `endDate`. A database constraint ensures `startDate < endDate`.

### Stores

**Table**: `stores`

Physical or virtual store locations with contact information, addresses, and opening hours.

**Key Fields**:
- `id`: Prefixed ID (`sto_xxx`)
- `name`: Store name
- `slug`: URL-friendly unique identifier
- `description`: JSONB field for rich content
- `isActive`: Boolean flag
- `sortOrder`: Integer for display ordering
- `phone`, `email`: Contact information
- `address`: JSONB structured address (street, postalCode, city, country, googleId)
- `openingHours`: JSONB structured hours (weekdays, saturday, sunday)
- `imageId`: Reference to media table
- `deletedAt`: Soft delete timestamp

**Related Tables**:
- `store_members`: Many-to-many relationship with users (store staff)
- `orders`: Orders associated with the store

### Orders

**Table**: `orders`

Orders represent customer purchases and support both B2C and B2B channels. They track status changes, payments, and can be associated with users, stores, or organizations.

**Key Fields**:
- `id`: Prefixed ID (`ord_xxx`)
- `orderNumber`: Unique order identifier
- `userId`: Optional reference to user (nullable for guest orders)
- `storeId`: Optional reference to store
- `companyId`: Optional reference to organization (B2B orders)
- `channel`: Enum (`B2C`, `B2B`)
- `currentStatus`: Enum (see Order Status enum)
- `totalCents`: Order total in cents
- `pickupDate`: Scheduled pickup timestamp

**Related Tables**:
- `order_items`: Line items in the order
- `order_status_events`: Audit trail of status changes
- `order_payments`: Payment records
- `deliveries`: Delivery information (one-to-one)

**Status Tracking**:
Orders maintain a `currentStatus` field and a separate `order_status_events` table for audit purposes, tracking who changed the status and when.

### Order Items

**Table**: `order_items`

Junction table linking orders to products with quantity, pricing, and product snapshot data.

**Key Fields**:
- `orderId`: Reference to order
- `productId`: Reference to product
- `productSnapshot`: JSONB snapshot of product at time of order (sku, name, price)
- `quantity`: Integer quantity
- `price`: Price per unit in cents
- `total`: Total line item cost in cents

**Composite Primary Key**: `(orderId, productId)`

### Payments

**Table**: `order_payments`

Payment records for orders, supporting multiple payment methods and status tracking.

**Key Fields**:
- `id`: Prefixed ID (`pay_xxx`)
- `orderId`: Reference to order
- `method`: Enum (`cash`, `card_dotypay`, `bank_transfer`, `other`)
- `status`: Enum (`pending`, `paid`, `failed`, `refunded`)
- `amountCents`: Payment amount in cents
- `provider`: Payment provider name
- `providerPaymentId`: External payment ID
- Timestamps: `authorizedAt`, `capturedAt`, `failedAt`

**Related Tables**:
- `payment_refunds`: Refund records

### Invoices

**Table**: `invoices`

B2B invoicing system with line items, status tracking, and billing addresses.

**Key Fields**:
- `id`: Prefixed ID (`inv_xxx`)
- `companyId`: Reference to organization
- `number`: Unique invoice number
- `series`: Invoice series (default: "A")
- `status`: Enum (`draft`, `issued`, `sent`, `partially_paid`, `paid`, `void`)
- `issueDate`: Invoice issue date
- `dueDate`: Payment due date
- `sentAt`: When invoice was sent
- `paidAt`: When invoice was paid
- `billingAddress`: JSONB structured address
- `subtotalCents`, `taxCents`, `totalCents`: Financial totals

**Related Tables**:
- `invoice_items`: Line items on the invoice

### Invoice Items

**Table**: `invoice_items`

Line items on invoices with product references and pricing.

**Key Fields**:
- `invoiceId`: Reference to invoice
- `lineId`: Line item identifier (part of composite key)
- `productId`: Optional reference to product (nullable if product deleted)
- `sku`: Product SKU
- `quantity`: Integer quantity
- `unitPriceCents`: Price per unit in cents
- `taxRatePct`: Tax rate percentage
- `totalCents`: Total line item cost in cents

**Composite Primary Key**: `(invoiceId, lineId)`

### Prices

**Table**: `prices`

Flexible pricing system supporting channel-based pricing (B2C/B2B), organization-specific pricing, quantity tiers, and time-based pricing windows.

**Key Fields**:
- `id`: Prefixed ID (`pri_xxx`)
- `productId`: Reference to product
- `channel`: Enum (`B2C`, `B2B`)
- `orgId`: Optional reference to organization (null for B2C, set for B2B)
- `amountCents`: Price in cents
- `minQty`: Minimum quantity for this price tier
- `priority`: Integer priority (higher = more important)
- `isActive`: Boolean flag
- `startsAt`, `endsAt`: Optional time-based pricing window

**Unique Constraint**: `(productId, channel, orgId, minQty, startsAt, endsAt, priority)`

**Pricing Logic**:
- B2C prices have `orgId = NULL`
- B2B prices have `orgId` set to specific organization
- Multiple prices can exist for the same product/channel with different `minQty`, time windows, or priorities
- Application logic selects the appropriate price based on context

### Product Channels

**Table**: `product_channels`

Controls which products are listed in which sales channels.

**Key Fields**:
- `productId`: Reference to product
- `channel`: Enum (`B2C`, `B2B`)
- `isListed`: Boolean flag for listing status

**Composite Primary Key**: `(productId, channel)`

### Media

**Table**: `media`

Centralized media storage for images and files used across the system.

**Key Fields**:
- `id`: Prefixed ID (`med_xxx`)
- `name`: File name
- `path`: Storage path
- `type`: MIME type
- `size`: File size in bytes

**Usage**:
- Product images (via `product_images`)
- Store images (via `stores.imageId`)

### Users & Authentication

**Tables**: `users`, `sessions`, `accounts`, `verifications`, `organizations`, `members`, `invitations`

Comprehensive authentication and user management system supporting:
- Multiple authentication providers (via `accounts`)
- Session management with IP and user agent tracking
- Organization/multi-tenancy support
- User roles and permissions
- Impersonation support (via `sessions.impersonatedBy`)
- User banning with expiration

**Key User Fields**:
- `id`: User ID (from auth provider)
- `name`, `email`: User information
- `emailVerified`: Verification status
- `phone`, `image`: Optional contact info
- `isAnonymous`: Anonymous user flag
- `role`: User role
- `banned`, `banReason`, `banExpires`: Ban management

### Deliveries

**Table**: `deliveries`

Delivery tracking for orders with time windows and addresses.

**Key Fields**:
- `id`: Prefixed ID (`del_xxx`)
- `orderId`: Unique reference to order (one-to-one)
- `windowStart`, `windowEnd`: Delivery time window
- `address`: JSONB structured delivery address
- `status`: Enum (`scheduled`, `out_for_delivery`, `delivered`, `failed`, `cancelled`)
- `notes`: Delivery notes

## Relationships

### Entity Relationship Diagram (Text)

```
Users
├── Sessions (1:N)
├── Accounts (1:N)
├── Members (1:N) → Organizations
├── StoreMembers (1:N) → Stores
└── Orders (1:N)

Organizations
├── Members (1:N) → Users
├── Orders (1:N)
├── Invoices (1:N)
├── Prices (1:N)
└── Invitations (1:N)

Products
├── ProductImages (N:M) → Media
├── ProductCategories (N:M) → Categories
├── ProductChannels (N:M) → Channels (enum)
├── Prices (1:N)
├── OrderItems (1:N) → Orders
└── InvoiceItems (1:N) → Invoices

Categories
├── CategoryAvailabilityWindows (1:N)
└── ProductCategories (N:M) → Products

Orders
├── OrderItems (1:N) → Products
├── OrderStatusEvents (1:N)
├── OrderPayments (1:N)
│   └── PaymentRefunds (1:N)
└── Deliveries (1:1)

Stores
├── StoreMembers (N:M) → Users
└── Orders (1:N)

Invoices
└── InvoiceItems (1:N) → Products
```

### Key Relationship Patterns

1. **Many-to-Many via Junction Tables**:
   - Products ↔ Categories (`product_categories`)
   - Products ↔ Media (`product_images`)
   - Products ↔ Channels (`product_channels`)
   - Users ↔ Stores (`store_members`)
   - Users ↔ Organizations (`members`)

2. **One-to-Many with Cascade Deletes**:
   - Products → Prices, Order Items, Invoice Items
   - Orders → Order Items, Payments, Status Events
   - Categories → Availability Windows

3. **Optional Foreign Keys**:
   - Orders can exist without users (guest orders)
   - Orders can exist without stores or organizations
   - Invoice items can exist without products (if product deleted)

4. **One-to-One**:
   - Orders ↔ Deliveries (via unique constraint on `orderId`)

## Enums

### Channel Enum
```typescript
["B2C", "B2B"]
```
Used for: Products, Prices, Orders, Product Channels

### Order Status Enum
```typescript
["cart", "new", "in_progress", "ready_for_pickup", "completed", "cancelled", "refunded"]
```
Represents the lifecycle of an order from cart to completion or cancellation.

### Payment Status Enum
```typescript
["pending", "paid", "failed", "refunded"]
```
Tracks payment processing status.

### Payment Method Enum
```typescript
["cash", "card_dotypay", "bank_transfer", "other"]
```
Supported payment methods.

### Invoice Status Enum
```typescript
["draft", "issued", "sent", "partially_paid", "paid", "void"]
```
Invoice lifecycle status.

### Product Status Enum
```typescript
["draft", "active", "inactive", "archived"]
```
Product lifecycle status.

### Delivery Status Enum
```typescript
["scheduled", "out_for_delivery", "delivered", "failed", "cancelled"]
```
Delivery tracking status.

## Design Patterns

### 1. Soft Deletes

Several tables use soft deletes via `deletedAt` timestamp:
- `products.deletedAt`
- `categories.deletedAt`
- `stores.deletedAt`

This allows data retention for audit purposes while hiding deleted records from normal queries.

### 2. Soft Archives

Products support soft archiving via `archivedAt` timestamp, separate from deletion. This allows products to be hidden without losing historical data.

### 3. Audit Trails

**Order Status Events**: Tracks all status changes with:
- Who changed it (`createdBy`)
- When it changed (`createdAt`)
- Optional note

This provides full auditability for order status transitions.

### 4. Data Snapshots

**Order Items** and **Invoice Items** store product snapshots (`productSnapshot`) to preserve historical data even if products are modified or deleted.

### 5. Prefixed IDs

All entities use prefixed IDs for better readability and debugging:
- Products: `prod_xxx`
- Categories: `cat_xxx`
- Orders: `ord_xxx`
- Prices: `pri_xxx`
- Stores: `sto_xxx`
- Invoices: `inv_xxx`
- Media: `med_xxx`
- Deliveries: `del_xxx`
- Payments: `pay_xxx`
- Refunds: `ref_xxx`
- Order Status Events: `ose_xxx`
- Category Availability: `cat-avail_xxx`

### 6. Timestamp Management

Standard timestamp fields across tables:
- `createdAt`: Set on creation (defaults to `now()`)
- `updatedAt`: Auto-updated on modification (via `$onUpdate`)

### 7. JSONB for Flexible Data

Several fields use JSONB for structured but flexible data:
- `products.description`: Rich content
- `stores.description`: Rich content
- `stores.address`: Structured address
- `stores.openingHours`: Structured hours
- `order_items.productSnapshot`: Product data snapshot
- `deliveries.address`: Delivery address
- `invoices.billingAddress`: Billing address

### 8. Cents-Based Pricing

All monetary values are stored as integers representing cents to avoid floating-point precision issues:
- `prices.amountCents`
- `orders.totalCents`
- `order_items.price`, `order_items.total`
- `order_payments.amountCents`
- `payment_refunds.amountCents`
- `invoices.subtotalCents`, `invoices.taxCents`, `invoices.totalCents`
- `invoice_items.unitPriceCents`, `invoice_items.totalCents`

### 9. Composite Primary Keys

Several junction tables use composite primary keys:
- `product_images`: `(productId, mediaId)`
- `product_categories`: `(productId, categoryId)`
- `product_channels`: `(productId, channel)`
- `order_items`: `(orderId, productId)`
- `invoice_items`: `(invoiceId, lineId)`
- `store_members`: `(storeId, userId)`

### 10. Indexing Strategy

Strategic indexes for performance:
- **Categories**: `sortOrder`, `slug`
- **Orders**: `orderNumber`, `(userId, storeId)`, `currentStatus`, `channel`, `pickupDate`, `createdAt`
- **Order Status Events**: `orderId`, `createdBy`
- **Payments**: `orderId`, `status`
- **Refunds**: `paymentId`
- **Invoices**: `companyId`, `status`, `issueDate`
- **Deliveries**: `status`
- **Prices**: Unique index on `(productId, channel, orgId, minQty, startsAt, endsAt, priority)`
- **Product Categories**: `(categoryId, sortOrder)`

### 11. Cascade Deletes

Foreign keys use cascade deletes where appropriate:
- Product deletion cascades to: images, categories, channels, prices, order items, invoice items
- Order deletion cascades to: items, status events, payments
- Category deletion cascades to: availability windows, product categories
- Store deletion cascades to: store members
- Organization deletion cascades to: members, invitations, prices

### 12. Nullable Foreign Keys

Some foreign keys are nullable to support optional relationships:
- `orders.userId`: Guest orders
- `orders.storeId`: Online-only orders
- `orders.companyId`: B2C orders
- `prices.orgId`: B2C pricing (NULL) vs B2B pricing (set)
- `invoice_items.productId`: Preserve invoice even if product deleted

## Schema Validation

The schema uses **drizzle-zod** to automatically generate Zod schemas from database tables. The `schemas.ts` file provides:

### Schema Types

1. **Insert Schemas**: For creating new records
   - `insertProductSchema`
   - `insertOrderSchema`
   - etc.

2. **Update Schemas**: For updating existing records
   - `updateProductSchema`
   - `updateOrderSchema`
   - etc.

3. **Create Schemas**: Insert schemas with auto-generated fields omitted
   - `createProductSchema` (omits: `id`, `createdAt`, `updatedAt`, `archivedAt`, `deletedAt`)
   - `createOrderSchema` (omits: `id`, `createdAt`, `updatedAt`, `orderNumber`)

4. **With Relations Schemas**: Extended schemas for complex operations
   - `createProductWithRelationsSchema`: Includes categories, channels, and prices arrays
   - `createOrderWithItemsSchema`: Includes items array
   - `createInvoiceWithItemsSchema`: Includes items array

### Usage Pattern

```typescript
// Create a product with relations
const productData: CreateProductWithRelations = {
  name: "Bread",
  slug: "bread",
  sku: "BRD001",
  // ... other fields
  categories: ["cat_123", "cat_456"],
  channels: [
    { channel: "B2C", isListed: true },
    { channel: "B2B", isListed: true }
  ],
  prices: [
    { channel: "B2C", amountCents: 200, minQty: 1 },
    { channel: "B2B", amountCents: 150, minQty: 10, orgId: "org_123" }
  ]
};
```

## Best Practices

1. **Always use Zod schemas** for validation before database operations
2. **Use prefixed IDs** for all new entities
3. **Store monetary values in cents** as integers
4. **Use soft deletes** for important entities (products, categories, stores)
5. **Create audit trails** for critical state changes (order status)
6. **Snapshot data** in order/invoice items to preserve historical accuracy
7. **Use JSONB** for structured but flexible data (addresses, descriptions)
8. **Index foreign keys** and frequently queried fields
9. **Use cascade deletes** carefully - only where data loss is acceptable
10. **Make foreign keys nullable** when relationships are optional

## Migration Notes

When modifying the schema:

1. Update the table definition in the appropriate schema file
2. Run Drizzle migrations to update the database
3. Zod schemas are auto-generated, but verify they match expectations
4. Update this documentation if relationships or patterns change
5. Consider data migration scripts for schema changes affecting existing data

