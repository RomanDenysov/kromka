import "server-only";

import { db } from "@/db";
import { media } from "@/db/schema";
import type { InsertMedia } from "../types";

export const MUTATIONS = {
  ADMIN: {
    UPLOAD_MEDIA: async (data: InsertMedia) => {
      const results = await db
        .insert(media)
        .values({
          name: data.name,
          path: data.path,
          url: data.url,
          type: data.type,
          size: data.size,
        })
        .returning();
      return results;
    },
  },
};
