"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [
  { value: "7d", label: "Posledných 7 dní" },
  { value: "30d", label: "Posledných 30 dní" },
  { value: "90d", label: "Posledných 90 dní" },
  { value: "mtd", label: "Tento mesiac" },
  { value: "ytd", label: "Tento rok" },
] as const;

interface Props {
  basePath: string;
}

export function PeriodPicker({ basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("period") ?? "30d";

  const handleChange = (preset: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("period", preset);
    router.replace(`${basePath}?${next.toString()}` as never);
  };

  return (
    <Select onValueChange={handleChange} value={current}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
