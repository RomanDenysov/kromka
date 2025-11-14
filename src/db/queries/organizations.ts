import "server-only";
import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_ORGANIZATIONS: async () =>
      await db.query.organizations.findMany({
        orderBy: (org, { asc }) => [asc(org.name)],
      }),

    GET_ORGANIZATION_BY_ID: async (id: string) =>
      await db.query.organizations.findFirst({
        where: (org, { eq }) => eq(org.id, id),
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          orders: {
            columns: {
              id: true,
              orderNumber: true,
              currentStatus: true,
            },
          },
          invoices: {
            columns: {
              id: true,
              number: true,
              status: true,
            },
          },
          prices: {
            columns: {
              id: true,
              productId: true,
              channel: true,
              amountCents: true,
            },
          },
        },
      }),

    GET_ORGANIZATION_BY_SLUG: async (slug: string) =>
      await db.query.organizations.findFirst({
        where: (org, { eq }) => eq(org.slug, slug),
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          orders: {
            columns: {
              id: true,
              orderNumber: true,
              currentStatus: true,
            },
          },
          invoices: {
            columns: {
              id: true,
              number: true,
              status: true,
            },
          },
          prices: {
            columns: {
              id: true,
              productId: true,
              channel: true,
              amountCents: true,
            },
          },
        },
      }),
  },
};
