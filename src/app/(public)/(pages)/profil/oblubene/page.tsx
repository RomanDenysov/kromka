import { redirect } from "next/navigation";

/**
 * Favorites route is temporarily disabled. Previous UI is preserved (not deleted) in
 * `src/features/favorites/deprecated/oblubene-route-archived.tsx` for reference when rewriting.
 */
export default function OblubenePage() {
  redirect("/profil");
}
