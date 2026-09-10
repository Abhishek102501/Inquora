"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { easePremium } from "@/lib/motion";
import { cn } from "cn";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "For researchers", href: "#verify" },
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
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-intel to-signal text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-serif text-[17px] font-semibold tracking-tight">Inqora</span>
        </Link>

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

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/dashboard">Sign in</Link>
          </Button>
          <Button className="hidden bg-signal text-signal-foreground hover:bg-signal/90 sm:inline-flex" asChild>
            <Link href="/dashboard">Get started</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[280px]">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-intel to-signal text-white">
                  <Sparkles className="size-3" />
                </span>
                <span className="font-serif text-base font-semibold">Inqora</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-4" />
              </Button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2.5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">Sign in</Link>
              </Button>
              <Button className="w-full bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                <Link href="/dashboard">Get started</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
