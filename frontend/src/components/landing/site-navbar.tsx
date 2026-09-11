"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FileStack, LayoutDashboard, Menu, MessagesSquare, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { easePremium } from "@/lib/motion";
import { cn } from "cn";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "For researchers", href: "#verify" },
];

const appLinks = [
  { label: "Documents", href: "/documents", icon: FileStack },
  { label: "Conversations", href: "/conversations", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scope = useId();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/75 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
        <BrandLogo />

        <nav
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHovered(link.href)}
              className="relative rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {hovered === link.href && (
                <motion.span
                  layoutId={`${scope}-nav-hover`}
                  className="absolute inset-0 rounded-md bg-muted"
                  transition={{ duration: 0.25, ease: easePremium }}
                  style={{ zIndex: -1 }}
                />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button className="hidden bg-signal text-signal-foreground hover:bg-signal/90 sm:inline-flex" asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="flex w-[85vw] max-w-[320px] flex-col p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            <div className="flex items-center justify-between">
              <BrandLogo size="sm" onClick={() => setMobileOpen(false)} />
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Separator className="my-4" />

            <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Workspace
            </p>
            <nav className="mt-1.5 flex flex-col gap-1">
              {appLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
                >
                  <link.icon className="size-4 text-muted-foreground" /> {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex items-center justify-between rounded-md px-3 py-2.5">
              <span className="text-sm font-medium text-foreground/80">Theme</span>
              <ThemeToggle />
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button className="w-full bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="size-4" /> Get started
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
