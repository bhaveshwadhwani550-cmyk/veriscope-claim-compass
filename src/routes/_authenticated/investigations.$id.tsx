import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { analyzeInvestigation } from "@/lib/investigations.functions";
import { investigationQuery, nextSourceCode, type SourceRow } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/investigations/$id")({
  head: () => ({ meta: [{ title: "Investigation — VeriScope" }] }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(investigationQuery(params.id)),
  component: InvestigationPage,
});

const stages = ["Reading sources", "Extracting claims & evidence", "Mapping topic dimensions", "Comparing claims for conflicts", "Checking recency", "Building verification roadmap"];

function InvestigationPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: inv } = useSuspenseQuery(investigationQuery(id));
  const analyze = useServerFn(analyzeInvestigation);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [view, setView] = useState<SourceRow | null>(null);

  useEffect(() => {
    if (!running) return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 9000);
    return () => clearInterval(t);
  }, [running]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["investigation", id] });
    qc.invalidateQueries({ queryKey: ["investigations"] });
  };

  async function run() {
    setRunning(true);
    try {
      const res = await analyze({ data: { id } });
      if (res.ok) toast.success("Analysis complete");
      else toast.error(res.error);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setRunning(false);
      refresh();
    }
  }

  async function remove(s: SourceRow) {
    const { error } = await supabase.from("sources").delete().eq("id", s.id);
    if (error) toast.error(error.message);
    refresh();
  }

  const isDemo = inv.sources.some((s) => s.is_demo);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={running ? "analyzing" : inv.status} />
            {isDemo && <StatusBadge status="medium" label="Demo sample sources" />}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold">{inv.topic}</h1>
          {inv.description && <p className="mt-1 text-muted-foreground">{inv.description}</p>}
        </div>
        <Button size="lg" onClick={run} disabled={running || inv.sources.length < 2}>
          {running ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {inv.analysis ? "Re-run analysis" : "Run analysis"}
        </Button>
      </div>

      {running && (
        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
          <p className="text-sm font-bold">Analyzing {inv.sources.length} sources… this usually takes 1–2 minutes.</p>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {stages.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 text-sm ${i <= stage ? "text-foreground" : "text-muted-foreground"}`}>
                {i < stage ? <span className="h-2 w-2 rounded-full bg-success" /> : i === stage ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <span className="h-2 w-2 rounded-full bg-border" />}
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
      {!running && inv.status === "failed" && inv.error && (
        <p className="mt-6 rounded-xl bg-destructive-soft p-4 text-sm text-destructive">{inv.error}</p>
      )}

      <section className="mt-8 rounded-2xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-bold">Source library</h2>
            <p className="text-xs text-muted-foreground">Automatic search isn't connected yet — add sources manually. At least two are needed.</p>
          </div>
          <AddSourceDialog investigationId={id} codes={inv.sources.map((s) => s.code)} onAdded={refresh} />
        </div>
        {inv.sources.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No sources yet. Paste text or upload a .txt / .csv file.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead className="hidden md:table-cell">Author</TableHead><TableHead>Date</TableHead><TableHead className="hidden sm:table-cell">Type</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {inv.sources.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="max-w-xs">
                      <button className="text-left font-medium hover:text-primary" onClick={() => setView(s)}>{s.title}</button>
                      {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="ml-1 inline-flex text-muted-foreground hover:text-primary"><ExternalLink className="h-3 w-3" /></a>}
                    </TableCell>
                    <TableCell className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:table-cell">{s.author ?? "—"}</TableCell>
                    <TableCell className="text-xs">{s.published_at ?? "—"}</TableCell>
                    <TableCell className="hidden text-xs capitalize sm:table-cell">{s.source_type}</TableCell>
                    <TableCell><StatusBadge status={running ? "processing" : s.status} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" aria-label="Remove source" onClick={() => remove(s)} disabled={running}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{view?.code} · {view?.title}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{view?.author} · {view?.published_at}</p>
          <p className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">{view?.content}</p>
        </DialogContent>
      </Dialog>

      {inv.analysis && !running && (
        <div className="mt-10">
          <AnalysisDashboard investigationId={id} analysis={inv.analysis} sources={inv.sources} onSourceOpen={setView} />
        </div>
      )}
    </div>
  );
}

function AddSourceDialog({ investigationId, codes, onAdded }: { investigationId: string; codes: string[]; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", author: "", published_at: "", source_type: "article", url: "", content: "" });
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    if (!/\.(txt|csv|md)$/i.test(file.name)) { toast.error("Only .txt, .csv and .md files are supported for now — paste the text from PDFs or Word files."); return; }
    const text = await file.text();
    setF((p) => ({ ...p, content: text, title: p.title || file.name.replace(/\.\w+$/, "") }));
  }

  async function save() {
    if (!f.title.trim() || f.content.trim().length < 40) { toast.error("Add a title and at least a paragraph of source text."); return; }
    setBusy(true);
    const { error } = await supabase.from("sources").insert({
      investigation_id: investigationId,
      code: nextSourceCode(codes),
      title: f.title.trim(),
      author: f.author || null,
      published_at: f.published_at || null,
      source_type: f.source_type,
      url: f.url || null,
      content: f.content.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setF({ title: "", author: "", published_at: "", source_type: "article", url: "", content: "" });
    setOpen(false);
    onAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline"><Plus /> Add source</Button></DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Add a source</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Author / organization</Label><Input value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Publication date</Label><Input type="date" value={f.published_at} onChange={(e) => setF({ ...f, published_at: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={f.source_type} onValueChange={(v) => setF({ ...f, source_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["research", "news", "report", "government", "article", "dataset", "other"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>URL (reference)</Label><Input type="url" placeholder="https://" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></div>
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Source text</Label>
              <label className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary">
                <Upload className="h-3.5 w-3.5" /> Upload .txt / .csv
                <input type="file" accept=".txt,.csv,.md" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </label>
            </div>
            <Textarea rows={7} placeholder="Paste the relevant passages from the source…" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
          </div>
          <Button onClick={save} disabled={busy}>Save source</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
