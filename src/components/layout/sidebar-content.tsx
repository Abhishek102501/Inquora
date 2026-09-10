"use client";

import Link from "next/link";
import { useId } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Plus, FileText, LogOut, User, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "cn";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navItems } from "@/components/layout/nav-items";
import { mockConversations } from "@/data/mock-conversations";
import { mockDocuments } from "@/data/mock-documents";
import { easePremium } from "@/lib/motion";

interface SidebarContentProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed, onToggleCollapse, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const scope = useId();
  const recentConversations = mockConversations.slice(0, 3);
  const shortcutDocuments = mockDocuments.filter((d) => d.status === "ready").slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <BrandLogo showWordmark={!collapsed} onClick={onNavigate} />
      </div>

      <div className={cn("px-3 pt-4", collapsed && "px-2")}>
        <Button
          className={cn(
            "w-full gap-2 bg-signal text-signal-foreground shadow-sm transition-all duration-200 hover:bg-signal/90 hover:shadow-md active:scale-[0.98]",
            collapsed && "px-0",
          )}
          onClick={() => {
            router.push("/chat");
            onNavigate?.();
          }}
        >
          <Plus className="size-4" />
          {!collapsed && "New chat"}
        </Button>
      </div>

      <nav className={cn("mt-2 flex flex-col gap-0.5 px-3", collapsed && "px-2")}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${scope}-sidebar-active-pill`}
                  className="absolute inset-0 rounded-md bg-sidebar-accent"
                  transition={{ duration: 0.28, ease: easePremium }}
                  style={{ zIndex: -1 }}
                />
              )}
              {active && !collapsed && (
                <motion.span
                  layoutId={`${scope}-sidebar-active-bar`}
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-signal"
                  transition={{ duration: 0.28, ease: easePremium }}
                />
              )}
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3">
          <div>
            <p className="px-2.5 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/45">
              Recent conversations
            </p>
            <div className="mt-1.5 flex flex-col gap-0.5">
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === `/chat/${conv.id}` && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <FileText className="size-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{conv.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="px-2.5 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/45">
              Document shortcuts
            </p>
            <div className="mt-1.5 flex flex-col gap-0.5">
              {shortcutDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === `/documents/${doc.id}` && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-signal/60" />
                  <span className="truncate">{doc.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {collapsed && <div className="flex-1" />}

      <div className="mt-auto border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-200 hover:bg-sidebar-accent",
                collapsed && "justify-center px-0",
              )}
            >
              <Avatar className="size-7 ring-1 ring-signal/20">
                <AvatarFallback className="bg-signal/15 text-[11px] font-medium text-signal">
                  AS
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                    Abhishek
                  </p>
                  <p className="truncate text-[11px] text-sidebar-foreground/50">
                    abhishek.dev1001@gmail.com
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 size-4" /> Profile & settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="mr-2 size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-md py-1.5 text-sidebar-foreground/50 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25, ease: easePremium }}
              className="flex"
            >
              {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </motion.span>
          </button>
        )}
      </div>
    </div>
  );
}
