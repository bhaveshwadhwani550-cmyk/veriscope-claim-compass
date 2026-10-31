import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient", className)}>
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5 5" />
        <path d="M8 10.5l2 2 3-4" />
      </svg>
    </span>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <LogoMark />
      <span className={cn("text-lg font-extrabold tracking-tight", dark ? "text-sidebar-accent-foreground" : "text-foreground")}>
        VeriScope
      </span>
    </Link>
  );
}
