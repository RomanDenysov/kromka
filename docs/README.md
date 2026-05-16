# Documentation

Project documentation for Pekáreň Kromka e-shop.

## General

| Document | Description |
|----------|-------------|
| [Database Schema](database-schema.md) | Database tables, relations, and entity details |
| [Product Management](product-management.md) | Guide for managing products in the admin |
| [Features Catalog](features-catalog.json) | Structured feature catalog for AI agents - business logic, APIs, dependencies, routes |

## Features

Detailed documentation for complex features:

| Feature | Documentation | Description |
|---------|---------------|-------------|
| Checkout | [Overview](features/checkout/README.md), [Changelog](features/checkout/changelog.md) | B2C checkout flow with pickup scheduling |
| B2B | [Overview](features/b2b/README.md), [Architecture](features/b2b/architecture.md), [API Actions](features/b2b/api-actions.md) | B2B partnership, pricing tiers, and invoice management |

## Specs

Implementation specs for upcoming work. **Read [`specs/_arc-overview.md`](specs/_arc-overview.md) first** for cross-cutting decisions (pricing model, role guards, cache tags, phasing) before diving into any phase spec.

| Spec | Phase | Description |
|------|-------|-------------|
| [Arc overview](specs/_arc-overview.md) | — | Pricing model, role guards, cache tags, mobile, rollback, phasing |
| [Allergens](specs/allergens-phase-a.md) | A | EU 14-allergen tags + PDP chips; pre-A scaffolding (tab structure, `unitCostCents` column, role guards) |
| [Ingredients catalog](specs/ingredients-phase-b.md) | B | Ingredient CRUD, price history, fuzzy search, duplicate detection, AI nutrition autofill |
| [Recipes + cost](specs/recipes-phase-c.md) | C | Recipe builder, cost resolver, order snapshot, recipe duplication |
| [Nutrition + PDP](specs/nutrition-pdp-phase-d.md) | D | Nutrition computation, PDP nutrition table, allergen-source switch, drift report |
| [ERP profitability](specs/erp-profitability-phase-e.md) | E | Store + product P&L, ingredient trends, CSV export, dashboard widget |
| [B2B price tiers CRUD](specs/b2b-price-tiers-crud.md) | — | (Independent of the arc.) Full CRUD for B2B price tiers |

## Adding Documentation

When documenting a feature:
1. Create `docs/features/<feature-name>.md` for architecture overview
2. Create `docs/features/<feature-name>-changelog.md` for tracking changes
3. Add entry to this index
