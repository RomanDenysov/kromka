import { MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserDetails } from "@/features/auth/session";

export async function QuickStoreSelector() {
  const userDetails = await getUserDetails();
  if (!userDetails) {
    return null;
  }
  const { store } = userDetails;
  return (
    <div className="mt-8">
      {store?.name ? (
        <button
          className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-medium text-neutral-900 transition-transform hover:scale-105"
          type="button"
        >
          <MapPinIcon className="size-4" />
          <span>{store.name}</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-500 text-sm">Zmeniť</span>
        </button>
      ) : (
        <Button className="rounded-full px-6" size="lg" variant="secondary">
          <MapPinIcon className="size-4" />
          Vybrať predajňu
        </Button>
      )}
    </div>
  );
}
