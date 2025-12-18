import {
  CheckCircle2Icon,
  CircleHelpIcon,
  CreditCardIcon,
  FileIcon,
  MapPinIcon,
  PackageIcon,
  StoreIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";

export const ORDER_STATUS_LABELS = {
  new: "Nová",
  in_progress: "Spracováva sa",
  ready_for_pickup: "Pripravená",
  completed: "Dokončená",
  cancelled: "Zrušená",
  refunded: "Vrátená",
};

export const ORDER_STATUS_ICONS = {
  cart: PackageIcon,
  new: PackageIcon,
  in_progress: TruckIcon,
  ready_for_pickup: MapPinIcon,
  completed: CheckCircle2Icon,
  cancelled: XCircleIcon,
  refunded: XCircleIcon,
} as const;

export const ORDER_STATUS_VARIANTS = {
  cart: "outline",
  new: "default",
  in_progress: "secondary",
  ready_for_pickup: "success",
  completed: "default",
  cancelled: "destructive",
  refunded: "secondary",
} as const;

export const WORKFLOW_STATUSES: string[] = [
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
];

export const PAYMENT_METHOD_LABELS = {
  in_store: "V predajni",
  card: "Kartou",
  invoice: "Faktúra",
  other: "Iné",
} as const;

export const PAYMENT_METHOD_ICONS = {
  in_store: StoreIcon,
  card: CreditCardIcon,
  invoice: FileIcon,
  other: CircleHelpIcon,
} as const;

export const PAYMENT_STATUS_VARIANTS = {
  pending: "outline",
  paid: "success",
  failed: "destructive",
  refunded: "secondary",
} as const;

export const PAYMENT_STATUS_LABELS = {
  pending: "Čaká na platbu",
  paid: "Zaplatená",
  failed: "Zlyhala",
  refunded: "Vrátená",
} as const;

export const PRODUCT_STATUSES_LABELS = {
  draft: "Draft",
  active: "Aktívny",
  sold: "Predaný",
  archived: "Archivovaný",
} as const;
