import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FilePlus2, FolderSearch, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/investigations/new", label: "New Investigation", icon: FilePlus2 },
  { to: "/investigations", label: "My Investigations", icon: FolderSearch },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <div className="px-2 py-2"><Logo dark /></div>
      <nav className="mt-8 grid gap-1">
        {nav.map((n) => {
          const active = n.to === "/investigations" ? path === "/investigations" || (/^\/investigations\/(?!new)/.test(path)) : path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-sidebar-border p-3">
        <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{user.user_metadata?.full_name || user.email}</p>
        <p className="truncate text-xs">{user.email}</p>
        <button onClick={signOut} className="mt-3 flex items-center gap-2 text-xs font-semibold hover:text-sidebar-accent-foreground">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block"><SidebarBody /></aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 p-0"><SidebarBody onNavigate={() => setOpen(false)} /></SheetContent>
          </Sheet>
          <Logo />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
