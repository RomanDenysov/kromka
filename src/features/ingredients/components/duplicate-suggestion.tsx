"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SimilarIngredient {
  id: string;
  name: string;
  score: number;
}

interface Props {
  /** server action wrapper that queries findSimilarIngredients */
  fetcher: (name: string) => Promise<SimilarIngredient[]>;
  name: string;
}

/**
 * Tiny inline suggester rendered under the ingredient name field on the
 * create form. Debounces, queries the trigram similarity, and renders
 * clickable chips when matches > 0.6.
 */
export function DuplicateSuggestion({ name, fetcher }: Props) {
  const [matches, setMatches] = useState<SimilarIngredient[]>([]);

  useEffect(() => {
    if (!name || name.trim().length < 2) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const found = await fetcher(name);
        setMatches(found);
      } catch {
        setMatches([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [name, fetcher]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-amber-600 text-xs dark:text-amber-400">
      Možno máte na mysli:{" "}
      {matches.map((m, idx) => (
        <span key={m.id}>
          <Link
            className="underline hover:text-amber-700"
            href={`/admin/ingredients/${m.id}` as never}
          >
            {m.name}
          </Link>
          {idx < matches.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}
