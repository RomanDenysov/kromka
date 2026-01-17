# B2B Architecture

System architecture, data flow, and component relationships for the B2B system.

## Entity Relationships

```mermaid
erDiagram
    b2b_applications ||--o{ users : "reviewedBy"
    b2b_applications }o--|| organizations : "becomes"
    
    organizations ||--o{ members : "has"
    organizations ||--o{ orders : "places"
    organizations ||--o{ invoices : "receives"
    organizations }o--|| priceTiers : "assigned"
    
    members }o--|| users : "is"
    
    priceTiers ||--o{ prices : "has"
    prices }o--|| products : "for"
    
    orders ||--o{ orderItems : "contains"
    orderItems }o--|| products : "references"
    orders }o--|| invoices : "linked"
    
    invoices }o--o{ orders : "groups"
```

## Application Approval Flow

```mermaid
sequenceDiagram
    participant Business
    participant ApplicationForm
    participant Database
    participant Admin
    participant EmailService
    participant AuthService
    
    Business->>ApplicationForm: Submit application
    ApplicationForm->>Database: Insert b2b_applications (pending)
    ApplicationForm->>EmailService: Notify admin
    EmailService->>Admin: Email notification
    
    Admin->>Database: Review application
    Admin->>Database: Approve application
    
    alt Approval
        Database->>Database: Create organization
        Database->>Database: Update application (approved)
        Database->>AuthService: Create invitation
        AuthService->>EmailService: Send invitation email
        EmailService->>Business: Invitation email
    else Rejection
        Database->>Database: Update application (rejected + reason)
        Database->>EmailService: Send rejection email
        EmailService->>Business: Rejection email
    end
```

## B2B Order Flow

```mermaid
sequenceDiagram
    participant B2BUser
    participant B2BShop
    participant Cart
    participant Checkout
    participant OrderService
    participant InvoiceService
    
    B2BUser->>B2BShop: Browse B2B catalog
    B2BShop->>B2BShop: Filter showInB2b products
    B2BShop->>B2BShop: Apply tier pricing
    B2BUser->>Cart: Add products
    Cart->>Cart: Calculate tier prices
    
    B2BUser->>Checkout: Proceed to checkout
    Checkout->>Checkout: Show invoice payment option
    B2BUser->>OrderService: Place order (invoice)
    
    OrderService->>OrderService: Set companyId
    OrderService->>OrderService: Store tier prices in orderItems
    OrderService->>OrderService: Create order (paymentStatus: pending)
    
    Note over InvoiceService: Periodically or manually
    InvoiceService->>InvoiceService: Generate invoice for period
    InvoiceService->>InvoiceService: Link orders to invoice
    InvoiceService->>InvoiceService: Send invoice PDF
    
    Note over InvoiceService: Payment received
    InvoiceService->>InvoiceService: Mark invoice paid
    InvoiceService->>OrderService: Update orders (paymentStatus: paid)
```

## Pricing Resolution

```mermaid
flowchart TD
    Start[Get Product Price] --> CheckUser{User in Organization?}
    CheckUser -->|No| BasePrice[Return base priceCents]
    CheckUser -->|Yes| GetTier[Get organization priceTierId]
    GetTier --> CheckTierPrice{Tier price exists?}
    CheckTierPrice -->|Yes| TierPrice[Return tier priceCents]
    CheckTierPrice -->|No| BasePrice
    TierPrice --> End[Display price]
    BasePrice --> End
```

## Admin Workflows

### Application Review

```mermaid
flowchart LR
    A[Pending Application] --> B{Admin Decision}
    B -->|Approve| C[Create Organization]
    C --> D[Assign Price Tier]
    D --> E[Send Invitation]
    E --> F[Mark Approved]
    B -->|Reject| G[Set Rejection Reason]
    G --> H[Send Rejection Email]
    H --> I[Mark Rejected]
```

### Price Tier Management

```mermaid
flowchart TD
    A[Create/Edit Price Tier] --> B[Set Name & Description]
    B --> C[Copy Base Prices]
    C --> D[Edit Product Prices]
    D --> E[Save Tier Prices]
    E --> F[Assign to Organizations]
```

### Invoice Generation

```mermaid
flowchart TD
    A[Select Organization] --> B[Choose Period]
    B --> C[Find Unpaid Orders]
    C --> D{Orders Found?}
    D -->|No| E[Show Error]
    D -->|Yes| F[Calculate Total]
    F --> G[Generate Invoice Number]
    G --> H[Create Invoice]
    H --> I[Link Orders]
    I --> J[Set Due Date]
    J --> K[Generate PDF]
    K --> L[Mark Issued]
```

## Component Structure

```
src/
├── app/
│   ├── (public)/
│   │   └── b2b/
│   │       ├── page.tsx              # Landing page
│   │       ├── apply/
│   │       │   └── page.tsx          # Application form
│   │       └── shop/
│   │           └── page.tsx          # B2B catalog
│   └── (admin)/
│       └── admin/
│           └── b2b/
│               ├── applications/      # Application management
│               ├── clients/          # Organization management
│               ├── price-tiers/      # Price tier management
│               └── invoices/         # Invoice management
├── features/
│   └── b2b/
│       ├── applications/             # Application queries/actions
│       ├── clients/                  # Organization queries/actions
│       ├── price-tiers/             # Price tier queries/actions
│       └── invoices/                # Invoice queries/actions
├── lib/
│   └── pricing.ts                   # Pricing utilities
└── validation/
    └── b2b.ts                       # B2B validation schemas
```
