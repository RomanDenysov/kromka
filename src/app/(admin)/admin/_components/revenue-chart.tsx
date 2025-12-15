/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import {
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const CENTS_PER_EURO = 100;
const RADIUS = 4;

type DataPoint = {
  date: string;
  revenue: number;
  expectedRevenue?: number;
  orderCount?: number;
};

type Props = {
  data: DataPoint[];
  showExpectedRevenue?: boolean;
  showOrderCorrelation?: boolean;
};

export function RevenueChart({
  data,
  showExpectedRevenue = false,
  showOrderCorrelation = false,
}: Props) {
  // Calculate correlation statistics if needed
  const correlationData = showOrderCorrelation
    ? data.map((point) => ({
        ...point,
        avgOrderValue:
          point.orderCount && point.orderCount > 0
            ? Math.round(point.revenue / point.orderCount / CENTS_PER_EURO)
            : 0,
      }))
    : data;

  const hasExpectedRevenueData =
    showExpectedRevenue &&
    data.some((d) => d.expectedRevenue && d.expectedRevenue > 0);

  return (
    <ResponsiveContainer height={showOrderCorrelation ? 400 : 350} width="100%">
      {hasExpectedRevenueData ? (
        <ComposedChart data={correlationData}>
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={12}
            stroke="#888888"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}.${date.getMonth() + 1}`;
            }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            stroke="#888888"
            tickFormatter={(value) => `${value / CENTS_PER_EURO}€`}
            tickLine={false}
            yAxisId="revenue"
          />
          {showOrderCorrelation && (
            <YAxis
              axisLine={false}
              fontSize={12}
              orientation="right"
              stroke="#888888"
              tickFormatter={(value) => `${value}`}
              tickLine={false}
              yAxisId="orders"
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const tooltipData = payload[0].payload as DataPoint & {
                  avgOrderValue?: number;
                };
                return (
                  <div className="space-y-2 rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-medium">{tooltipData.date}</div>

                    {showExpectedRevenue && tooltipData.expectedRevenue && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">
                            Očakávané
                          </span>
                          <span className="font-semibold text-blue-600">
                            {formatPrice(tooltipData.expectedRevenue)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">
                            Skutočné
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatPrice(tooltipData.revenue)}
                          </span>
                        </div>
                        <div className="col-span-2 flex flex-col">
                          <span className="text-muted-foreground uppercase">
                            Rozdiel
                          </span>
                          <span
                            className={`font-semibold ${tooltipData.revenue >= (tooltipData.expectedRevenue || 0) ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatPrice(
                              tooltipData.revenue -
                                (tooltipData.expectedRevenue || 0)
                            )}
                            (
                            {Math.round(
                              (tooltipData.revenue /
                                (tooltipData.expectedRevenue || 1)) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                      </div>
                    )}

                    {!showExpectedRevenue && (
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          Tržba
                        </span>
                        <span className="font-bold">
                          {formatPrice(tooltipData.revenue)}
                        </span>
                      </div>
                    )}

                    {showOrderCorrelation && tooltipData.orderCount && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">
                            Objednávky
                          </span>
                          <span className="font-semibold">
                            {tooltipData.orderCount}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground uppercase">
                            Priemer
                          </span>
                          <span className="font-semibold">
                            {tooltipData.avgOrderValue || 0}€
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Expected Revenue */}
          {hasExpectedRevenueData && (
            <Bar
              dataKey="expectedRevenue"
              fill="#3b82f6"
              fillOpacity={0.3}
              radius={[RADIUS, RADIUS, 0, 0]}
              yAxisId="revenue"
            />
          )}

          {/* Actual Revenue */}
          <Bar
            className="fill-primary"
            dataKey="revenue"
            fill="currentColor"
            radius={[RADIUS, RADIUS, 0, 0]}
            yAxisId="revenue"
          />

          {/* Order Count Line */}
          {showOrderCorrelation && (
            <Line
              dataKey="orderCount"
              dot={{ r: 3 }}
              stroke="#ef4444"
              strokeWidth={2}
              type="monotone"
              yAxisId="orders"
            />
          )}
        </ComposedChart>
      ) : (
        <BarChart data={correlationData}>
          <XAxis
            axisLine={false}
            dataKey="date"
            fontSize={12}
            stroke="#888888"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}.${date.getMonth() + 1}`;
            }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            stroke="#888888"
            tickFormatter={(value) => `${value / CENTS_PER_EURO}€`}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const tooltipData = payload[0].payload as DataPoint & {
                  avgOrderValue?: number;
                };
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          Dátum
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {tooltipData.date}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          Tržba
                        </span>
                        <span className="font-bold">
                          {formatPrice(tooltipData.revenue)}
                        </span>
                      </div>
                      {showOrderCorrelation && tooltipData.orderCount && (
                        <>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] text-muted-foreground uppercase">
                              Objednávky
                            </span>
                            <span className="font-bold">
                              {tooltipData.orderCount}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] text-muted-foreground uppercase">
                              Priemer
                            </span>
                            <span className="font-bold">
                              {tooltipData.avgOrderValue || 0}€
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            className="fill-primary"
            dataKey="revenue"
            fill="currentColor"
            radius={[RADIUS, RADIUS, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
