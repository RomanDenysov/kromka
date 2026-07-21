import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { FilterDef, SectionConfig } from "./types";

/**
 * Builds nuqs parsers from a section's list config.
 * Stub-ready for the table/grid PR — unused by nav-only shell.
 */
export function buildParsers<T>(cfg: SectionConfig<T>) {
  const views = cfg.views ?? [];
  const defaultView = cfg.defaultView ?? views[0]?.view ?? "table";
  const sortable = views.flatMap((v) =>
    v.view === "table"
      ? v.columns.filter((c) => c.sortable).map((c) => c.key)
      : []
  );

  const viewLiterals = views.map((v) => v.view);
  const filterParsers = Object.fromEntries(
    (cfg.filters ?? []).flatMap((f: FilterDef<T>) => {
      if (f.options === "dynamic") {
        return [[f.key, parseAsString.withDefault("")] as const];
      }
      if (f.options.length === 0) {
        return [];
      }
      return [
        [
          f.key,
          parseAsStringLiteral(f.options).withDefault(f.options[0] ?? ""),
        ] as const,
      ];
    })
  );

  return {
    view:
      viewLiterals.length > 0
        ? parseAsStringLiteral(viewLiterals).withDefault(defaultView)
        : parseAsStringLiteral(["table", "grid"] as const).withDefault(
            defaultView
          ),
    q: parseAsString.withDefault(""),
    sort:
      sortable.length > 0
        ? parseAsStringLiteral(sortable).withDefault(sortable[0] ?? "")
        : parseAsString.withDefault(""),
    dir: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
    page: parseAsInteger.withDefault(1),
    ...filterParsers,
  };
}
