import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FilePlus2, FileSearch, FolderSearch, GitCompareArrows, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InvestigationCard } from "@/components/InvestigationCard";
import { investigationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VeriScope" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(investigationsQuery()),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(investigationsQuery());
  const totals = data.reduce(
    (t, i) => ({
      sources: t.sources + i.source_count,
      conflicts: t.conflicts + (i.analysis?.conflicts.filter((c) => c.verdict !== "complementary").length ?? 0),
      gaps: t.gaps + (i.analysis?.dimensions.filter((d) => d.coverage === "none" || d.coverage === "limited").length ?? 0),
    }),
    { sources: 0, conflicts: 0, gaps: 0 },
  );
  const stats = [
    { label: "Research projects", value: data.length, icon: FolderSearch, tone: "bg-primary-soft text-primary" },
    { label: "Sources analyzed", value: totals.sources, icon: FileSearch, tone: "bg-secondary text-secondary-foreground" },
    { label: "Potential conflicts", value: totals.conflicts, icon: GitCompareArrows, tone: "bg-destructive-soft text-destructive" },
    { label: "Information gaps", value: totals.gaps, icon: SearchX, tone: "bg-warning-soft text-warning" },
  ];
  const first = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Research workspace</p>
          <h1 className="text-3xl font-extrabold">Welcome{first ? `, ${first}` : ""}</h1>
        </div>
        <Button asChild><Link to="/investigations/new"><FilePlus2 /> New Investigation</Link></Button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-card">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.tone}`}><s.icon className="h-4.5 w-4.5" /></span>
            <p className="mt-3 text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-bold">Recent investigations</h2>
      {data.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed bg-card p-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-bold">No investigations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Start with the demo topic to see the full analysis in a couple of minutes.</p>
          <Button asChild className="mt-5"><Link to="/investigations/new">Start investigating</Link></Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.slice(0, 6).map((i) => <InvestigationCard key={i.id} inv={i} />)}
        </div>
      )}
    </div>
  );
}
