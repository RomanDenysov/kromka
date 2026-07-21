import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BriefcaseIcon,
  ChartColumnIcon,
  ChefHatIcon,
  ClipboardListIcon,
  FactoryIcon,
  FileTextIcon,
  FlaskConicalIcon,
  ImagesIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  NewspaperIcon,
  Package2Icon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  TagsIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
  WheatIcon,
} from "lucide-react";
import type { AdminIconId } from "./types";

export const adminIconMap: Record<AdminIconId, LucideIcon> = {
  activity: ActivityIcon,
  briefcase: BriefcaseIcon,
  "chart-column": ChartColumnIcon,
  "chef-hat": ChefHatIcon,
  "clipboard-list": ClipboardListIcon,
  factory: FactoryIcon,
  "file-text": FileTextIcon,
  "flask-conical": FlaskConicalIcon,
  images: ImagesIcon,
  "layout-template": LayoutTemplateIcon,
  "message-square": MessageSquareIcon,
  newspaper: NewspaperIcon,
  package: Package2Icon,
  settings: SettingsIcon,
  "shopping-bag": ShoppingBagIcon,
  "shopping-cart": ShoppingCartIcon,
  store: StoreIcon,
  tags: TagsIcon,
  "trending-up": TrendingUpIcon,
  users: UsersIcon,
  wallet: WalletIcon,
  wheat: WheatIcon,
};

export function getAdminIcon(id: AdminIconId): LucideIcon {
  return adminIconMap[id];
}
