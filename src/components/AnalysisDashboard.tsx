import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Clock, FileSearch, GitCompareArrows, Quote, Route as RouteIcon, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { coverageLabel, coverageScore, questionStatuses, type Analysis, type Claim } from "@/lib/analysis";
import type { SourceRow } from "@/lib/queries";

type Props = { investigationId: string; analysis: Analysis; sources: SourceRow[]; onSourceOpen: (s: SourceRow) => void };

export function AnalysisDashboard({ investigationId, analysis, sources, onSourceOpen }: Props) {
  const [tab, setTab] = useState("overview");
  const srcByCode = useMemo(() => new Map(sources.map((s) => [s.code, s])), [sources]);
  const claimById = useMemo(() => new Map(analysis.claims.map((c) => [c.id, c])), [analysis.claims]);
  const gaps = analysis.dimensions.filter((d) => d.coverage === "none" || d.coverage === "limited");
  const outdated = analysis.outdated.filter((o) => o.recency !== "recent");

  const stats = [
    { label: "Sources analyzed", value: sources.length, icon: FileSearch, tone: "bg-primary-soft text-primary", tab: "claims" },
    { label: "Claims extracted", value: analysis.claims.length, icon: Quote, tone: "bg-secondary text-secondary-foreground", tab: "claims" },
    { label: "Conflicts", value: analysis.conflicts.length, icon: GitCompareArrows, tone: "bg-destructive-soft text-destructive", tab: "conflicts" },
    { label: "Information gaps", value: gaps.length, icon: SearchX, tone: "bg-warning-soft text-warning", tab: "gaps" },
    { label: "Possibly outdated", value: outdated.length, icon: Clock, tone: "bg-muted text-muted-foreground", tab: "outdated" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold">Analysis dashboard</h2>
        <p className="text-xs text-muted-foreground">AI-generated {new Date(analysis.generated_at).toLocaleString()} · verify before citing</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <button key={s.label} onClick={() => setTab(s.tab)} className="rounded-2xl border bg-card p-4 text-left shadow-card transition hover:border-primary/40">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.tone}`}><s.icon className="h-4 w-4" /></span>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="gaps">Gaps</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="outdated">Outdated</TabsTrigger>
          <TabsTrigger value="verify">Next-best verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="What the evidence says">
            <p className="leading-relaxed">{analysis.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">AI interpretation of the provided sources — not an established fact.</p>
          </Card>
          <Card title="Evidence coverage by dimension">
            <CoverageRadar analysis={analysis} />
          </Card>
          <Card title="Top verification priorities" className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              {analysis.verifications.slice(0, 3).map((v) => (
                <button key={v.title} onClick={() => setTab("verify")} className="rounded-xl border p-4 text-left hover:border-primary/40">
                  <StatusBadge status={v.priority} />
                  <p className="mt-2 font-semibold leading-snug">{v.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{v.why}</p>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="mt-5 grid gap-3">
          {analysis.claims.map((c) => <ClaimCard key={c.id} claim={c} source={srcByCode.get(c.source_code)} onOpen={onSourceOpen} />)}
        </TabsContent>

        <TabsContent value="gaps" className="mt-5 grid gap-5">
          <Card title="Topic map">
            <div className="grid gap-3">
              {analysis.dimensions.map((d) => (
                <div key={d.name}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{d.name}</p>
                    <StatusBadge status={d.coverage} label={coverageLabel[d.coverage]} />
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-brand-gradient" style={{ width: `${Math.max(coverageScore[d.coverage], 2)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{d.note} {d.claim_ids.length > 0 && `· ${d.claim_ids.length} supporting claims`}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Coverage reflects how much evidence the sources contain, not whether it is true.</p>
          </Card>
          <QuestionList investigationId={investigationId} analysis={analysis} />
        </TabsContent>

        <TabsContent value="conflicts" className="mt-5 grid gap-4">
          {analysis.conflicts.length === 0 && <Empty text="No conflicting claims were found between sources." />}
          {analysis.conflicts.map((c, i) => {
            const a = claimById.get(c.claim_a_id)!;
            const b = claimById.get(c.claim_b_id)!;
            return (
              <div key={i} className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={c.severity} label={`${c.severity} severity`} />
                  <StatusBadge status={c.verdict} label={c.verdict === "genuine" ? "Genuine contradiction" : c.verdict === "apparent" ? "Apparent — different context" : c.verdict} />
                  <span className="text-xs text-muted-foreground">{c.conflict_type} · {c.confidence} confidence</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[a, b].map((cl, j) => <ClaimCard key={cl.id} claim={cl} source={srcByCode.get(cl.source_code)} onOpen={onSourceOpen} label={j === 0 ? "Claim A" : "Claim B"} compact />)}
                </div>
                <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
                  <p className="font-semibold">Why they may disagree</p>
                  <p className="mt-1 text-muted-foreground">{c.explanation}</p>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                    <div><dt className="font-semibold">Population</dt><dd className="text-muted-foreground">{c.same_population}</dd></div>
                    <div><dt className="font-semibold">Methodology</dt><dd className="text-muted-foreground">{c.methodology}</dd></div>
                    <div><dt className="font-semibold">Time period</dt><dd className="text-muted-foreground">{c.time_period}</dd></div>
                  </dl>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="outdated" className="mt-5 grid gap-3">
          {analysis.outdated.map((o) => {
            const s = srcByCode.get(o.source_code);
            return (
              <div key={o.source_code} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-card sm:flex-row sm:items-start">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.recency} />
                    <span className="font-mono text-xs text-muted-foreground">{o.source_code}</span>
                  </div>
                  <button className="mt-1 text-left font-semibold hover:text-primary" onClick={() => s && onSourceOpen(s)}>{s?.title}</button>
                  <p className="text-xs text-muted-foreground">Published {s?.published_at ?? "unknown"}</p>
                  <p className="mt-2 text-sm">{o.reason}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-sm sm:w-72">
                  <p className="text-xs font-semibold">Suggested action</p>
                  <p className="mt-1 text-muted-foreground">{o.action}</p>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">A newer source doesn't automatically make an older one wrong. "Find newer evidence" will be available once search is connected.</p>
        </TabsContent>

        <TabsContent value="verify" className="mt-5 grid gap-4">
          {analysis.verifications.map((v, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                <StatusBadge status={v.priority} label={v.priority === "critical" ? "Critical" : `${v.priority} priority`} />
                <StatusBadge status="draft" label={v.finding_type.replace("_", " ")} />
              </div>
              <p className="mt-2 text-lg font-bold">{v.title}</p>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <Field k="Why verify" v={v.why} />
                <Field k="Question to ask" v={v.question_to_ask} />
                <Field k="Evidence available" v={v.available_evidence} />
                <Field k="Evidence missing" v={v.missing_evidence} />
                <Field k="Where to search" v={v.where_to_search} />
                <Field k="Most useful source type" v={v.source_type} />
              </dl>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-success-soft p-3 text-sm">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span><span className="font-semibold">Resolved when: </span>{v.resolution_criteria}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>
      <p className="mb-3 text-sm font-bold text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs font-semibold text-muted-foreground">{k}</dt><dd className="mt-0.5">{v}</dd></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">{text}</div>;
}

function CoverageRadar({ analysis }: { analysis: Analysis }) {
  const data = analysis.dimensions.map((d) => ({ name: d.name.length > 18 ? d.name.slice(0, 17) + "…" : d.name, v: coverageScore[d.coverage] }));
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
          <Radar dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ClaimCard({ claim, source, onOpen, label, compact }: { claim: Claim; source?: SourceRow; onOpen: (s: SourceRow) => void; label?: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card p-4 ${compact ? "" : "shadow-card"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {label && <span className="text-xs font-bold text-primary">{label}</span>}
        <span className="font-mono text-xs text-muted-foreground">{claim.id}</span>
        <StatusBadge status={claim.category} />
        <span className="text-xs text-muted-foreground">{claim.dimension} · {claim.confidence} extraction confidence</span>
      </div>
      <p className="mt-2 font-semibold leading-snug">{claim.statement}</p>
      <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">"{claim.excerpt}"</blockquote>
      {source && (
        <button onClick={() => onOpen(source)} className="mt-2 text-xs font-semibold text-primary hover:underline">
          {source.code} · {source.title}{source.published_at ? ` (${source.published_at.slice(0, 4)})` : ""}
        </button>
      )}
    </div>
  );
}

function QuestionList({ investigationId, analysis }: { investigationId: string; analysis: Analysis }) {
  const qc = useQueryClient();
  async function setStatus(i: number, status: string) {
    const next = { ...analysis, question_status: { ...analysis.question_status, [String(i)]: status } };
    await supabase.from("investigations").update({ analysis: next as unknown as Json }).eq("id", investigationId);
    qc.invalidateQueries({ queryKey: ["investigation", investigationId] });
  }
  const labels: Record<string, string> = { unresolved: "Unresolved", investigating: "Under investigation", answered: "Answered", not_relevant: "Not relevant" };
  return (
    <div className="grid gap-3">
      <h3 className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-warning" /> Unanswered research questions</h3>
      {analysis.questions.map((q, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="flex-1 font-bold">{q.question}</p>
            <Select value={analysis.question_status[String(i)] ?? "unresolved"} onValueChange={(v) => setStatus(i, v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{questionStatuses.map((s) => <SelectItem key={s} value={s}>{labels[s]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <Field k="Why it matters" v={q.why_it_matters} />
            <Field k="Existing evidence" v={q.existing_evidence} />
            <Field k="Missing evidence" v={q.missing_evidence} />
            <div><dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><RouteIcon className="h-3 w-3" /> Suggested sources</dt><dd className="mt-0.5">{q.suggested_sources}</dd></div>
          </dl>
        </div>
      ))}
    </div>
  );
}
