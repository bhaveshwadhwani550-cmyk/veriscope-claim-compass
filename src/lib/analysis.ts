import { z } from "zod";

// Shared (browser-safe) analysis schema + normalization.

export const claimCategories = ["fact", "finding", "prediction", "interpretation"] as const;
export const levels3 = ["high", "medium", "low"] as const;
export const coverageLevels = ["high", "moderate", "limited", "none"] as const;
export const conflictVerdicts = ["genuine", "apparent", "complementary", "inconclusive"] as const;
export const recencyLevels = ["recent", "aging", "potentially_outdated"] as const;
export const priorities = ["critical", "high", "medium", "low"] as const;
export const findingTypes = ["gap", "conflict", "outdated", "weak_claim"] as const;
export const questionStatuses = ["unresolved", "investigating", "answered", "not_relevant"] as const;

export const analysisSchema = z.object({
  summary: z.string(),
  claims: z.array(
    z.object({
      id: z.string(),
      statement: z.string(),
      source_code: z.string(),
      excerpt: z.string(),
      category: z.enum(claimCategories),
      dimension: z.string(),
      confidence: z.enum(levels3),
    }),
  ),
  dimensions: z.array(
    z.object({
      name: z.string(),
      coverage: z.enum(coverageLevels),
      claim_ids: z.array(z.string()),
      note: z.string(),
    }),
  ),
  questions: z.array(
    z.object({
      question: z.string(),
      why_it_matters: z.string(),
      existing_evidence: z.string(),
      missing_evidence: z.string(),
      suggested_sources: z.string(),
    }),
  ),
  conflicts: z.array(
    z.object({
      claim_a_id: z.string(),
      claim_b_id: z.string(),
      conflict_type: z.string(),
      severity: z.enum(levels3),
      verdict: z.enum(conflictVerdicts),
      confidence: z.enum(levels3),
      explanation: z.string(),
      same_population: z.string(),
      methodology: z.string(),
      time_period: z.string(),
    }),
  ),
  outdated: z.array(
    z.object({
      source_code: z.string(),
      recency: z.enum(recencyLevels),
      reason: z.string(),
      action: z.string(),
    }),
  ),
  verifications: z.array(
    z.object({
      title: z.string(),
      finding_type: z.enum(findingTypes),
      priority: z.enum(priorities),
      why: z.string(),
      available_evidence: z.string(),
      missing_evidence: z.string(),
      where_to_search: z.string(),
      source_type: z.string(),
      question_to_ask: z.string(),
      resolution_criteria: z.string(),
    }),
  ),
});

export type RawAnalysis = z.infer<typeof analysisSchema>;
export type Analysis = RawAnalysis & {
  generated_at: string;
  model: string;
  question_status: Record<string, (typeof questionStatuses)[number]>;
};
export type Claim = RawAnalysis["claims"][number];

/**
 * Enforces provenance rules: a claim without a known source is dropped, and every
 * conflict / coverage reference must point to a surviving claim.
 */
export function normalizeAnalysis(raw: RawAnalysis, sourceCodes: string[]): RawAnalysis {
  const known = new Set(sourceCodes);
  const seen = new Set<string>();
  const claims = raw.claims.filter((c) => {
    if (!known.has(c.source_code) || !c.excerpt.trim() || seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  const ids = new Set(claims.map((c) => c.id));
  const bySource = new Map(claims.map((c) => [c.id, c.source_code]));
  return {
    ...raw,
    claims,
    dimensions: raw.dimensions.map((d) => {
      const claim_ids = d.claim_ids.filter((id) => ids.has(id));
      return { ...d, claim_ids, coverage: claim_ids.length === 0 ? "none" : d.coverage };
    }),
    conflicts: raw.conflicts.filter(
      (c) =>
        ids.has(c.claim_a_id) &&
        ids.has(c.claim_b_id) &&
        c.claim_a_id !== c.claim_b_id &&
        bySource.get(c.claim_a_id) !== bySource.get(c.claim_b_id),
    ),
    outdated: raw.outdated.filter((o) => known.has(o.source_code)),
    verifications: [...raw.verifications].sort(
      (a, b) => priorities.indexOf(a.priority) - priorities.indexOf(b.priority),
    ),
  };
}

export const coverageLabel: Record<(typeof coverageLevels)[number], string> = {
  high: "High coverage",
  moderate: "Moderate coverage",
  limited: "Limited coverage",
  none: "No evidence found",
};
export const coverageScore: Record<(typeof coverageLevels)[number], number> = {
  high: 100,
  moderate: 66,
  limited: 33,
  none: 0,
};
