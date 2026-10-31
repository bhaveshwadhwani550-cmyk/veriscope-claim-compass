import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";

import { analysisSchema, normalizeAnalysis, type RawAnalysis } from "./analysis";

export const ANALYSIS_MODEL = "openai/gpt-6-astra";

export type SourceInput = {
  code: string;
  title: string;
  author: string | null;
  published_at: string | null;
  source_type: string;
  content: string;
};

const INSTRUCTIONS = `You are VeriScope's evidence analyst. You analyse ONLY the sources provided.
Rules:
- Every claim must quote a verbatim excerpt (max ~40 words) from its source and use that source's exact code (e.g. SRC-001). Never invent claims, sources, URLs, statistics or dates.
- Categorise claims honestly: fact (directly stated fact), finding (research result), prediction, interpretation.
- Build a topic map of 6-10 important research dimensions for the topic, INCLUDING dimensions the sources do not cover. Coverage reflects evidence volume, not truth. List the claim ids that support each dimension; uncovered dimensions get an empty list and coverage "none".
- Generate 4-7 unanswered research questions tied to the gaps.
- Conflicts: only compare claims from different sources about the same subject. Do not flag different wording as contradiction. Distinguish genuine vs apparent (different definitions, populations, time periods) vs complementary vs inconclusive. Explain population, methodology and time-period differences.
- Outdated: judge recency relative to how fast the domain changes and the current date given. A newer source does not automatically make an older one wrong. Include every source with its recency.
- Verifications: 5-8 concrete next steps, each tied to a gap, conflict, outdated item or weakly supported claim; say where to search and what result would resolve the uncertainty.
- Claim ids: C1, C2, ... Keep the summary to 2-3 sentences and clearly hedge.`;

export async function runAnalysis(
  topic: string,
  sources: SourceInput[],
  signal?: AbortSignal,
): Promise<RawAnalysis> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const body = sources
    .map(
      (s) =>
        `### ${s.code} | ${s.title}\nAuthor: ${s.author ?? "unknown"} | Published: ${s.published_at ?? "unknown"} | Type: ${s.source_type}\n${s.content.slice(0, 12000)}`,
    )
    .join("\n\n");

  const result = streamText({
    model: provider.responses(ANALYSIS_MODEL),
    instructions: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: `Today's date: ${new Date().toISOString().slice(0, 10)}\nResearch topic: ${topic}\n\nSOURCES:\n${body}`,
      },
    ],
    output: Output.object({ schema: analysisSchema }),
    abortSignal: signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return normalizeAnalysis(output, sources.map((s) => s.code));
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The analysis came back incomplete. Please try running it again.");
    }
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 402) throw new Error("AI credits are used up for this workspace. Add credits to keep analysing.");
    if (status === 429) throw new Error("The AI service is busy right now. Please wait a minute and try again.");
    throw error;
  }
}
