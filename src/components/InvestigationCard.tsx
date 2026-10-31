import { Link } from "@tanstack/react-router";

import type { Analysis } from "@/lib/analysis";
import { StatusBadge } from "@/components/StatusBadge";

export function InvestigationCard({
  inv,
}: {
  inv: { id: string; topic: string; status: string; created_at: string; source_count: number; analysis: Analysis | null };
}) {
  return (
    <Link
      to="/investigations/$id"
      params={{ id: inv.id }}
      className="block rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold leading-snug">{inv.topic}</p>
        <StatusBadge status={inv.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()} · {inv.source_count} sources</p>
      {inv.analysis && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-accent-foreground">{inv.analysis.claims.length} claims</span>
          <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-destructive">{inv.analysis.conflicts.length} conflicts</span>
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-warning">
            {inv.analysis.dimensions.filter((d) => d.coverage === "none" || d.coverage === "limited").length} gaps
          </span>
        </div>
      )}
    </Link>
  );
}
