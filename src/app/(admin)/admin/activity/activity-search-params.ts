import { createLoader, parseAsStringEnum } from "nuqs/server";
import { ACTIVITY_ENTITY_TYPES, ACTIVITY_ROLES } from "@/db/types";

export const activitySearchParams = {
  entity: parseAsStringEnum([...ACTIVITY_ENTITY_TYPES]),
  role: parseAsStringEnum([...ACTIVITY_ROLES]),
};

export const loadActivitySearchParams = createLoader(activitySearchParams);

export type ActivitySearchParams = Awaited<
  ReturnType<typeof loadActivitySearchParams>
>;
