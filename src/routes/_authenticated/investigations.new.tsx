import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_TOPIC, demoSources } from "@/lib/demo-sources";

export const Route = createFileRoute("/_authenticated/investigations/new")({
  head: () => ({ meta: [{ title: "New Investigation — VeriScope" }] }),
  component: NewInvestigation,
});

const examples = [
  "Climate change and agriculture",
  "Electric vehicles and environmental sustainability",
  "AI in healthcare",
  "Social media and mental health",
];

function NewInvestigation() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function create(withDemo: boolean) {
    const t = withDemo ? DEMO_TOPIC : topic.trim();
    if (!t) return toast.error("Enter a research topic first");
    setBusy(true);
    const { data, error } = await supabase
      .from("investigations")
      .insert({ topic: t, description: withDemo ? "Demo investigation using labelled sample sources." : description || null })
      .select("id")
      .single();
    if (error || !data) {
      setBusy(false);
      return toast.error(error?.message ?? "Could not create investigation");
    }
    if (withDemo) {
      const { error: e2 } = await supabase.from("sources").insert(
        demoSources.map((s, i) => ({ ...s, investigation_id: data.id, code: `SRC-${String(i + 1).padStart(3, "0")}`, is_demo: true })),
      );
      if (e2) toast.error(e2.message);
    }
    qc.invalidateQueries({ queryKey: ["investigations"] });
    navigate({ to: "/investigations/$id", params: { id: data.id } });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold">New Investigation</h1>
      <p className="mt-1 text-muted-foreground">Name the topic, then add the sources you want VeriScope to compare.</p>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-card">
        <div className="grid gap-1.5">
          <Label htmlFor="topic">Research topic</Label>
          <Input id="topic" placeholder="e.g. Impact of Artificial Intelligence on Employment" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((e) => (
            <button key={e} onClick={() => setTopic(e)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">{e}</button>
          ))}
        </div>
        <div className="mt-5 grid gap-1.5">
          <Label htmlFor="desc">Research focus (optional)</Label>
          <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Automatic source discovery (web &amp; academic search) isn't connected yet. You'll add sources manually on the next screen.
        </div>
        <Button className="mt-5 w-full" disabled={busy} onClick={() => create(false)}>Create investigation</Button>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary-soft p-6">
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-bold">Demo mode: {DEMO_TOPIC}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Loads {demoSources.length} sample passages written for this demo (not real publications, clearly labelled) so you can run the full analysis right away.
            </p>
            <Button variant="outline" className="mt-4" disabled={busy} onClick={() => create(true)}>Load demo investigation</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
