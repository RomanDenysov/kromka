import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { FilterDef, SectionConfig } from "./types";

/**
 * Builds nuqs parsers from a section's list config (view, search, sort, filters, page).
 */
export function buildParsers(cfg: SectionConfig) {
  const views = cfg.views ?? [];
  const defaultView = cfg.defaultView ?? views[0]?.view ?? "table";
  const sortable = views.flatMap((v) =>
    v.view === "table"
      ? v.columns.filter((c) => c.sortable).map((c) => c.key)
      : []
  );

  const viewLiterals = (
    views.length > 0 ? views.map((v) => v.view) : ["table", "grid"]
  ) as Array<"table" | "grid">;

  const filterParsers = Object.fromEntries(
    (cfg.filters ?? []).flatMap((f: FilterDef) => {
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
    view: parseAsStringLiteral(viewLiterals).withDefault(defaultView),
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

export function createSectionParamsLoader(cfg: SectionConfig) {
  return createLoader(buildParsers(cfg));
}
