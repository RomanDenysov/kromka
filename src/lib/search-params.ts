import {
  createSearchParamsCache,
  parseAsBoolean,
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
};

export const loginModalCache = createSearchParamsCache(loginModalParams);
