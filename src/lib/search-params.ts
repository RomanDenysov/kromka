import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export type LoginReason = "favorites" | "checkout" | "default";

export const loginModalParams = {
  login: parseAsBoolean.withDefault(false),
  reason: parseAsStringEnum<LoginReason>([
    "favorites",
    "checkout",
    "default",
  ]).withDefault("default"),
  origin: parseAsString.withDefault(""),
};

export const loginModalCache = createSearchParamsCache(loginModalParams);
