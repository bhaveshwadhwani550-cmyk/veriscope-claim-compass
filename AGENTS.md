<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Analysis runs in one authenticated server function (`src/lib/investigations.functions.ts`) that calls the AI gateway from `src/lib/ai.server.ts`; keeps prompts and keys server-side.
- AI output passes through `normalizeAnalysis` (`src/lib/analysis.ts`) before saving; it enforces provenance (no claim without a known source and excerpt), so never bypass it.
- The full analysis is stored as JSON on `investigations.analysis`; sources live in their own table with per-investigation `SRC-xxx` codes so claims can cite them.
- Demo mode uses clearly labelled fictional sample passages (`src/lib/demo-sources.ts`) with no URLs until search APIs are connected; never present them as real publications.
