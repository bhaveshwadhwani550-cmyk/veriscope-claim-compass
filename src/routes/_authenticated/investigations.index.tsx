import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InvestigationCard } from "@/components/InvestigationCard";
import { investigationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/investigations/")({
  head: () => ({ meta: [{ title: "My Investigations — VeriScope" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(investigationsQuery()),
  component: List,
});

function List() {
  const { data } = useSuspenseQuery(investigationsQuery());
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">My Investigations</h1>
        <Button asChild><Link to="/investigations/new"><FilePlus2 /> New</Link></Button>
      </div>
      {data.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">{data.map((i) => <InvestigationCard key={i.id} inv={i} />)}</div>
      )}
    </div>
  );
}
