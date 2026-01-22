import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStoreLoad } from "@/features/admin-dashboard/api/metrics";
import { formatPrice } from "@/lib/utils";

export async function StoreLoadCard() {
  const storeLoad = await getStoreLoad();

  if (storeLoad.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-sm">
            Zaťaženie predajní
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Žiadne údaje</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium text-sm">
          Zaťaženie predajní
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {storeLoad.map((store) => (
            <div className="space-y-2" key={store.storeId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{store.storeName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {store.orderCount} objednávok
                  </span>
                  <span className="font-semibold">
                    {formatPrice(store.revenueCents)}
                  </span>
                </div>
              </div>
              <Progress className="h-2" value={store.percentage} />
              <p className="text-muted-foreground text-xs">
                {store.percentage}% z celkového počtu
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
