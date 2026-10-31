import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export const analyzeInvestigation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: inv, error } = await supabase
      .from("investigations")
      .select("id, topic, analysis")
      .eq("id", data.id)
      .single();
    if (error || !inv) throw new Error("Investigation not found.");

    const { data: sources } = await supabase
      .from("sources")
      .select("id, code, title, author, published_at, source_type, content")
      .eq("investigation_id", data.id)
      .order("code");
    if (!sources || sources.length < 2) throw new Error("Add at least two sources to compare evidence.");

    await supabase.from("investigations").update({ status: "analyzing", error: null }).eq("id", data.id);
    await supabase.from("sources").update({ status: "processing" }).eq("investigation_id", data.id);

    try {
      const { runAnalysis, ANALYSIS_MODEL } = await import("@/lib/ai.server");
      const raw = await runAnalysis(inv.topic, sources);
      const prev = (inv.analysis as { question_status?: Record<string, string> } | null)?.question_status;
      const analysis = {
        ...raw,
        generated_at: new Date().toISOString(),
        model: ANALYSIS_MODEL,
        question_status: prev ?? {},
      };
      await supabase
        .from("investigations")
        .update({ status: "complete", analysis: analysis as unknown as Json, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      await supabase.from("sources").update({ status: "processed" }).eq("investigation_id", data.id);
      return { ok: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Analysis failed.";
      await supabase.from("investigations").update({ status: "failed", error: message }).eq("id", data.id);
      await supabase.from("sources").update({ status: "failed" }).eq("investigation_id", data.id);
      return { ok: false as const, error: message };
    }
  });
