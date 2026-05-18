# Documentation

Project documentation for Pekáreň Kromka e-shop.

## General

| Document | Description |
|----------|-------------|
| [Database Schema](database-schema.md) | Database tables, relations, and entity details |
| [Features Catalog](features-catalog.json) | Structured feature catalog for AI agents - business logic, APIs, dependencies, routes |

## Features

Detailed documentation for complex features:

| Feature | Documentation | Description |
|---------|---------------|-------------|
| Checkout | [Overview](features/checkout/README.md) | B2C checkout flow with pickup scheduling |
| B2B | [Overview](features/b2b/README.md), [Architecture](features/b2b/architecture.md), [API Actions](features/b2b/api-actions.md) | B2B partnership, pricing tiers, and invoice management |

## Specs

Cross-cutting architecture references.

| Spec | Description |
|------|-------------|
| [Costing architecture](specs/costing-architecture.md) | Pricing model (cents/kg or cents/piece), role guards, cache tags, mobile, rollback. Cited from source comments. |
| [B2B price tiers CRUD](specs/b2b-price-tiers-crud.md) | Full CRUD for B2B price tiers |

## Adding Documentation

When documenting a feature, create `docs/features/<feature-name>/README.md` for the architecture overview and add an entry to this index.
