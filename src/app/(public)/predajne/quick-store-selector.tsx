import { MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth/session";

export async function QuickStoreSelector() {
  const { user, store } = await getAuth();
  if (!user) {
    return null;
  }

  return (
    <div className="mt-8">
      {store ? (
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
