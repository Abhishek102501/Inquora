"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { routeTitle } from "@/components/layout/route-titles";

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu className="size-5" />
      </Button>

      <h1 className="truncate font-serif text-[18px] font-semibold tracking-tight">
        {routeTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <form
          className="group relative hidden sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) router.push(`/documents?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-signal" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="h-9 w-48 pl-8 transition-all duration-200 focus-visible:w-64 lg:w-64"
            aria-label="Search documents"
          />
        </form>
        <ThemeToggle />
      </div>
    </header>
  );
}
