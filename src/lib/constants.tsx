import {
  CircleHelpIcon,
  CreditCardIcon,
  FileIcon,
  StoreIcon,
} from "lucide-react";

export const PAYMENT_METHOD_LABELS = {
  in_store: "V predajni",
  card: "Kartou",
  invoice: "Faktúra",
  other: "Iné",
};

export const PAYMENT_METHOD_ICONS = {
  in_store: <StoreIcon />,
  card: <CreditCardIcon />,
  invoice: <FileIcon />,
  other: <CircleHelpIcon />,
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Čaká na platbu",
  paid: "Zaplatená",
  failed: "Zlyhala",
  refunded: "Vrátená",
};
