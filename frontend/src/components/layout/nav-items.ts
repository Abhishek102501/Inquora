import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, FileStack, MessagesSquare, Star, Settings } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileStack },
  { label: "Conversations", href: "/conversations", icon: MessagesSquare },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Settings", href: "/settings", icon: Settings },
];
