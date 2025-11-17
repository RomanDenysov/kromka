import type { RankingInfo } from "@tanstack/match-sorter-utils";
import type { FilterFn } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Augment FilterFns so "fuzzy" is recognized as a valid filter function name
  // Note: This makes filterFns required when using string literals like "fuzzy"
  // Tables using useDataTable get it automatically, others must provide filterFns
  // biome-ignore lint/style/useConsistentTypeDefinitions: Module augmentation requires interface
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  // biome-ignore lint/style/useConsistentTypeDefinitions: Module augmentation requires interface
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}
