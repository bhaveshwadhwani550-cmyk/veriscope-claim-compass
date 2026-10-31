import { describe, expect, it } from "vitest";

import { normalizeAnalysis, type RawAnalysis } from "@/lib/analysis";

const claim = (id: string, source_code: string, excerpt = "quoted text") => ({
  id, statement: "s", source_code, excerpt, category: "finding" as const, dimension: "d", confidence: "high" as const,
});
const base: RawAnalysis = {
  summary: "", claims: [], dimensions: [], questions: [], conflicts: [], outdated: [], verifications: [],
};
const conflict = (a: string, b: string) => ({
  claim_a_id: a, claim_b_id: b, conflict_type: "t", severity: "high" as const, verdict: "genuine" as const,
  confidence: "high" as const, explanation: "", same_population: "", methodology: "", time_period: "",
});

describe("normalizeAnalysis provenance rules", () => {
  it("drops claims whose source is not in the investigation", () => {
    const out = normalizeAnalysis({ ...base, claims: [claim("C1", "SRC-001"), claim("C2", "SRC-999")] }, ["SRC-001"]);
    expect(out.claims.map((c) => c.id)).toEqual(["C1"]);
  });

  it("drops claims with no supporting excerpt", () => {
    const out = normalizeAnalysis({ ...base, claims: [claim("C1", "SRC-001", "  ")] }, ["SRC-001"]);
    expect(out.claims).toHaveLength(0);
  });

  it("keeps conflicts only between claims from different sources", () => {
    const out = normalizeAnalysis(
      {
        ...base,
        claims: [claim("C1", "SRC-001"), claim("C2", "SRC-001"), claim("C3", "SRC-002")],
        conflicts: [conflict("C1", "C2"), conflict("C1", "C3"), conflict("C1", "C9")],
      },
      ["SRC-001", "SRC-002"],
    );
    expect(out.conflicts.map((c) => c.claim_b_id)).toEqual(["C3"]);
  });

  it("marks a dimension as 'none' when none of its claims survive", () => {
    const out = normalizeAnalysis(
      { ...base, dimensions: [{ name: "Gender", coverage: "high", claim_ids: ["C7"], note: "" }] },
      ["SRC-001"],
    );
    expect(out.dimensions[0]?.coverage).toBe("none");
  });
});
