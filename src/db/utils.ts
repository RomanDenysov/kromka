import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";

export const draftSlug = (name: string) =>
  `${getSlug(name)}-${createShortId()}`;
