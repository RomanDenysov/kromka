import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFrequentlyBoughtTogether } from "@/features/admin-dashboard/api/metrics";

export async function FrequentlyBoughtCard() {
  const data = await getFrequentlyBoughtTogether();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-sm">Často spolu</CardTitle>
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
        <CardTitle className="font-medium text-sm">Často spolu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((pair, _index) => (
            <div
              className="flex items-start justify-between gap-2 text-sm"
              key={`${pair.product1Id}-${pair.product2Id}`}
            >
              <div className="flex-1 space-y-1">
                <div className="font-medium">{pair.product1Name}</div>
                <div className="text-muted-foreground text-xs">
                  + {pair.product2Name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{pair.frequency}x</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
