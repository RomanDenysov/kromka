import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { FilterDef, SectionConfig } from "./types";

const VIEW_OPTIONS = ["table", "grid"] as const;
const DIR_OPTIONS = ["asc", "desc"] as const;

/**
 * Builds nuqs parsers from a section's list config (view, search, sort, filters, page).
 * Reuse the returned object in both createLoader (server) and useQueryStates (client).
 * @see https://nuqs.dev/docs/server-side
 */
export function buildParsers(cfg: SectionConfig) {
  const views = cfg.views ?? [];
  const defaultView = cfg.defaultView ?? views[0]?.view ?? "table";
  const allowedViews =
    views.length > 0
      ? (views.map((v) => v.view) as (typeof VIEW_OPTIONS)[number][])
      : [...VIEW_OPTIONS];

  const sortable = views.flatMap((v) =>
    v.view === "table"
      ? v.columns.filter((c) => c.sortable).map((c) => c.key)
      : []
  );

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
    view: parseAsStringLiteral(VIEW_OPTIONS)
      .withDefault(
        allowedViews.includes(defaultView) ? defaultView : VIEW_OPTIONS[0]
      )
      .withOptions({ clearOnDefault: false }),
    q: parseAsString.withDefault(""),
    sort:
      sortable.length > 0
        ? parseAsStringLiteral(sortable as [string, ...string[]]).withDefault(
            sortable[0] ?? ""
          )
        : parseAsString.withDefault(""),
    dir: parseAsStringLiteral(DIR_OPTIONS).withDefault("asc"),
    page: parseAsInteger.withDefault(1),
    ...filterParsers,
  };
}

export type SectionSearchParams = ReturnType<typeof buildParsers>;

/** One-off server parse — same shape as useQueryStates. */
export function createSectionParamsLoader(cfg: SectionConfig) {
  return createLoader(buildParsers(cfg));
}
