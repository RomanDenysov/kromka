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
              orderStatus: true,
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
              orderStatus: true,
            },
          },
        },
      }),
  },
};
