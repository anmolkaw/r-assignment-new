"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, LayoutDashboard, Logs, Network, Sparkles, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/module-1", label: "Module 1", icon: Sparkles },
  { href: "/module-2", label: "Module 2", icon: Wand2 },
  { href: "/logs", label: "Logs", icon: Logs },
  { href: "/architecture", label: "Architecture", icon: Network }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 flex-col border-r border-border/70 bg-background/45 p-4 backdrop-blur-xl lg:flex">
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4">
          <div className="rounded-lg bg-primary/20 p-2 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Rayeva AI</p>
            <p className="text-xs text-muted-foreground">Commerce Console</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/55 px-4 py-3 backdrop-blur-lg md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              {links.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant={pathname === link.href ? "default" : "ghost"}
                  size="sm"
                  className="px-2"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
            <div className="hidden text-sm text-muted-foreground lg:block">
              Production-style AI tooling for sustainable commerce workflows
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
