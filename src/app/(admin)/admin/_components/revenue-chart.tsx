"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const CENTS_PER_EURO = 100;
const RADIUS = 4;

type Props = {
  data: { date: string; revenue: number }[];
};

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer height={350} width="100%">
      <BarChart data={data}>
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
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] text-muted-foreground uppercase">
                        Dátum
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.date}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] text-muted-foreground uppercase">
                        Tržba
                      </span>
                      <span className="font-bold">
                        {formatPrice(payload[0].value as number)}
                      </span>
                    </div>
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
    </ResponsiveContainer>
  );
}
