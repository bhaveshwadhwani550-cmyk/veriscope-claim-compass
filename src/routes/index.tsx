import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileSearch,
  GitCompareArrows,
  Layers,
  Network,
  Route as RouteIcon,
  SearchX,
  CheckCircle2,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VeriScope — Look Beyond the Information" },
      {
        name: "description",
        content:
          "Analyze multiple sources, uncover conflicting claims, identify information gaps and get a verification roadmap.",
      },
      { property: "og:title", content: "VeriScope — Look Beyond the Information" },
      {
        property: "og:description",
        content: "AI-powered evidence intelligence: find what's missing, contradictory or outdated in your research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Layers, title: "Multi-Source Analysis", text: "Analyze research papers, articles, reports, websites and other information sources side by side." },
  { icon: SearchX, title: "Information Gap Detection", text: "Map the dimensions of a topic and see which ones have little or no evidence." },
  { icon: GitCompareArrows, title: "Conflict Detection", text: "Compare claims across sources and separate genuine contradictions from different contexts." },
  { icon: Clock, title: "Outdated Information", text: "Flag aging statistics and potentially superseded findings, judged by how fast the field moves." },
  { icon: Network, title: "Evidence Explorer", text: "Every claim is tied to a verbatim excerpt and the source it came from." },
  { icon: RouteIcon, title: "Verification Roadmap", text: "A prioritised list of exactly what to investigate next — and what would settle it." },
];

const steps = [
  "Enter a research topic",
  "Collect information from multiple sources",
  "Extract and analyze evidence with AI",
  "Identify conflicts, gaps and outdated information",
  "Generate a verification roadmap",
];

const faqs = [
  { q: "Is VeriScope a chatbot or summarizer?", a: "No. It doesn't just restate what sources say — it shows what's missing, uncertain, contradictory or in need of verification." },
  { q: "Does it make up sources?", a: "Never. Every claim must quote an excerpt from a source you added. Claims without a source reference are discarded automatically." },
  { q: "What is demo mode?", a: "Automatic web and academic search isn't connected yet. Demo mode loads clearly-labelled sample passages so you can try the full analysis; you can always paste your own sources." },
  { q: "Does 'high coverage' mean a claim is true?", a: "No. Coverage indicators describe how much evidence exists for a dimension, not whether it is correct." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How It Works</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign In</Link></Button>
            <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
              Look Beyond the Information.
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
              Information is everywhere. <span className="text-brand-gradient">But what are we missing?</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Analyze multiple sources, uncover conflicting claims, identify information gaps, and discover exactly what
              needs verification with AI-powered evidence intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-elevated">
                <Link to="/auth" search={{ mode: "signup" }}>Start Investigating <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline"><a href="#demo">Explore Demo</a></Button>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead eyebrow="Features" title="Built to find what's missing" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-navy py-20 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">From topic to verification roadmap</h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s} className="rounded-2xl border border-sidebar-border bg-sidebar-accent p-5">
                <span className="font-mono text-sm text-violet">0{i + 1}</span>
                <p className="mt-3 font-semibold leading-snug">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="Why VeriScope" title="Don't just learn what exists. Learn what's uncertain." left />
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Most AI tools summarise. VeriScope audits. It tells you what is currently known, which sources back it,
            where they disagree, what has likely gone stale, and what you should verify next.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {["Students & researchers", "Journalists & fact-checkers", "Policy analysts", "Product & market teams"].map((u) => (
            <li key={u} className="flex items-center gap-3 rounded-xl border bg-card p-4 font-semibold shadow-card">
              <CheckCircle2 className="h-5 w-5 text-success" /> {u}
            </li>
          ))}
        </ul>
      </section>

      <section id="demo" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl border bg-card p-8 shadow-card sm:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Interactive demo</p>
              <h3 className="mt-1 text-2xl font-extrabold">Try "Impact of AI on Employment"</h3>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Create a free account, then load five labelled sample sources and watch VeriScope surface conflicts,
                missing dimensions and a verification plan.
              </p>
            </div>
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Open the demo <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>Discover the gaps. Challenge the claims. Verify the truth.</p>
          <p>© {new Date().getFullYear()} VeriScope</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title, left }: { eyebrow: string; title: string; left?: boolean }) {
  return (
    <div className={left ? "" : "text-center"}>
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
    </div>
  );
}

function DashboardPreview() {
  const stats = [
    { label: "Sources analyzed", value: "12", icon: FileSearch, tone: "text-primary bg-primary-soft" },
    { label: "Conflicting claims", value: "4", icon: GitCompareArrows, tone: "text-destructive bg-destructive-soft" },
    { label: "Information gaps", value: "7", icon: SearchX, tone: "text-warning bg-warning-soft" },
    { label: "Outdated items", value: "3", icon: AlertTriangle, tone: "text-muted-foreground bg-muted" },
  ];
  const bars = [
    ["Job displacement", 92],
    ["Job creation", 64],
    ["Skill requirements", 58],
    ["Rural employment", 22],
    ["Gender differences", 0],
  ] as const;
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-15 blur-2xl" />
      <div className="relative rounded-3xl border bg-card p-5 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">AI & Employment — analysis</p>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Complete</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}><s.icon className="h-4 w-4" /></span>
              <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border p-4">
          <p className="text-xs font-semibold text-muted-foreground">Evidence coverage</p>
          <div className="mt-3 space-y-2.5">
            {bars.map(([n, v]) => (
              <div key={n}>
                <div className="flex justify-between text-xs"><span>{n}</span><span className="text-muted-foreground">{v === 0 ? "No evidence" : `${v}%`}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-brand-gradient" style={{ width: `${Math.max(v, 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">Illustrative preview</p>
      </div>
    </div>
  );
}
