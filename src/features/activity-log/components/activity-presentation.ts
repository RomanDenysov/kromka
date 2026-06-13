import {
  ActivityIcon,
  ArchiveIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  CroissantIcon,
  FileTextIcon,
  type LucideIcon,
  PackageIcon,
  PencilIcon,
  ShoppingBagIcon,
  StoreIcon,
  TagIcon,
  TriangleAlertIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import type { Route } from "next";
import type {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
  ActivityRole,
} from "@/db/types";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "outline";

type ActivityTone = "default" | "success" | "warning" | "info";

interface ActivityVisual {
  icon: LucideIcon;
  tone: ActivityTone;
}

/** Per-action icon + tone. Falls back to the entity icon when an action is unmapped. */
const ACTION_VISUALS: Partial<Record<ActivityAction, ActivityVisual>> = {
  "order.created": { icon: ShoppingBagIcon, tone: "info" },
  "order.status_changed": { icon: PackageIcon, tone: "default" },
  "order.pickup_updated": { icon: CalendarClockIcon, tone: "default" },
  "order.cancelled": { icon: XCircleIcon, tone: "warning" },
  "payment.received": { icon: CreditCardIcon, tone: "success" },
  "product.created": { icon: CroissantIcon, tone: "info" },
  "product.updated": { icon: PencilIcon, tone: "default" },
  "product.archived": { icon: ArchiveIcon, tone: "default" },
  "store.deactivated": { icon: ArchiveIcon, tone: "default" },
  "b2b_application.submitted": { icon: Building2Icon, tone: "info" },
  "b2b_application.approved": { icon: CheckCircle2Icon, tone: "success" },
  "b2b_application.rejected": { icon: TriangleAlertIcon, tone: "warning" },
};

const ENTITY_ICONS: Record<ActivityEntityType, LucideIcon> = {
  order: ShoppingBagIcon,
  product: CroissantIcon,
  b2b_application: Building2Icon,
  organization: Building2Icon,
  store: StoreIcon,
  invoice: FileTextIcon,
  promo_code: TagIcon,
  user: UserIcon,
};

const TONE_CLASSES: Record<ActivityTone, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

/** Slovak fallback label used when an entry has no pre-rendered summary. */
export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  "order.created": "Nová objednávka",
  "order.status_changed": "Zmena stavu objednávky",
  "order.pickup_updated": "Zmena vyzdvihnutia",
  "order.cancelled": "Objednávka zrušená",
  "payment.received": "Platba prijatá",
  "product.created": "Nový produkt",
  "product.updated": "Úprava produktu",
  "product.archived": "Produkt archivovaný",
  "store.deactivated": "Predajňa deaktivovaná",
  "b2b_application.submitted": "Nová B2B žiadosť",
  "b2b_application.approved": "B2B žiadosť schválená",
  "b2b_application.rejected": "B2B žiadosť zamietnutá",
};

/** Resolve the icon component and tone class for a feed row. */
export function getActivityVisual(
  action: ActivityAction,
  entityType: ActivityEntityType
): { Icon: LucideIcon; toneClass: string } {
  const visual = ACTION_VISUALS[action];
  return {
    Icon: visual?.icon ?? ENTITY_ICONS[entityType] ?? ActivityIcon,
    toneClass: TONE_CLASSES[visual?.tone ?? "default"],
  };
}

/** Build the admin link for an entity, or null when no detail route exists. */
export function getActivityHref(
  entityType: ActivityEntityType,
  entityId: string
): Route | null {
  switch (entityType) {
    case "order":
      return `/admin/eshop/orders/${entityId}` as Route;
    case "product":
      return `/admin/eshop/products/${entityId}` as Route;
    case "store":
      return `/admin/eshop/stores/${entityId}` as Route;
    case "b2b_application":
      return `/admin/b2b/applications/${entityId}` as Route;
    case "organization":
      return `/admin/b2b/clients/${entityId}` as Route;
    case "user":
      return `/admin/system/users/${entityId}` as Route;
    default:
      return null;
  }
}

/** Human label per entity type (filters, detail rows). */
export const ACTIVITY_ENTITY_LABELS: Record<ActivityEntityType, string> = {
  order: "Objednávka",
  product: "Produkt",
  b2b_application: "B2B žiadosť",
  organization: "B2B klient",
  store: "Predajňa",
  invoice: "Faktúra",
  promo_code: "Promo kód",
  user: "Používateľ",
};

export const ACTIVITY_ROLE_LABELS: Record<ActivityRole, string> = {
  staff: "Personál",
  user: "Zákazník",
  guest: "Hosť",
  system: "Systém",
};

const ACTIVITY_ROLE_VARIANTS: Record<ActivityRole, BadgeVariant> = {
  staff: "default",
  user: "secondary",
  guest: "outline",
  system: "outline",
};

/**
 * Derive the display role from the stored actor columns:
 * staff/system come straight from actorType; a customer with an account is a
 * "user", an anonymous customer is a "guest".
 */
export function getActorRole(
  actorType: ActivityActorType,
  actorId: string | null
): ActivityRole {
  if (actorType === "staff") {
    return "staff";
  }
  if (actorType === "system") {
    return "system";
  }
  return actorId ? "user" : "guest";
}

export function getActorRoleBadge(
  actorType: ActivityActorType,
  actorId: string | null
): { label: string; variant: BadgeVariant } {
  const role = getActorRole(actorType, actorId);
  return {
    label: ACTIVITY_ROLE_LABELS[role],
    variant: ACTIVITY_ROLE_VARIANTS[role],
  };
}
