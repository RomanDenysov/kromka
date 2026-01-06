# Pekáreň Kromka

Online store and blog for a bakery chain in eastern Slovakia. Sells bread, coffee, rolls, and other delicacies. Most establishments belong to Kavejo s.r.o. and Kromka s.r.o.

The store is built on a pick-up system - customers order online and pick up at a store. B2B segment has delivery available.

Solo project - I handle development, design, and product decisions with help from AI tools (Cursor, Claude).

## Stack

- Next.js 16 with App Router and Server Actions
- React 19 with React Compiler
- PostgreSQL (Neon) + Drizzle ORM
- Better-auth for authentication
- Tailwind CSS + Radix UI components
- Vercel Blob for image storage
- PostHog for analytics

## Structure

```
src/
├── app/           # Routes (public + admin)
├── components/    # UI components
├── lib/
│   ├── actions/   # Server Actions
│   ├── queries/   # Database queries
│   ├── auth/      # Auth config
│   └── email/     # Email templates
├── db/            # Schema + migrations
└── config/
```

## Development

```bash
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

## What it does

- Product catalog with categories
- Shopping cart and checkout (pickup date selection)
- Order tracking
- Multiple store locations
- B2B ordering with invoices
- Blog (Tiptap editor)
- Admin dashboard
- Email notifications (orders, receipts, pickup ready)

## Deployment

Hosted on Vercel.

- [pekarenkromka.sk](https://pekarenkromka.sk)
- [shop.pekarenkromka.sk](https://shop.pekarenkromka.sk)

## Status

Working on admin improvements, order workflow, and B2B features. Payment integration coming.
