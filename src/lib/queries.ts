import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Analysis } from "@/lib/analysis";

export type SourceRow = {
  id: string;
  code: string;
  title: string;
  author: string | null;
  published_at: string | null;
  source_type: string;
  url: string | null;
  content: string;
  is_demo: boolean;
  status: string;
};

export const investigationsQuery = () =>
  queryOptions({
    queryKey: ["investigations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investigations")
        .select("id, topic, status, analysis, created_at, updated_at, sources(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((d) => ({
        ...d,
        analysis: d.analysis as unknown as Analysis | null,
        source_count: (d.sources as unknown as { count: number }[])[0]?.count ?? 0,
      }));
    },
  });

export const investigationQuery = (id: string) =>
  queryOptions({
    queryKey: ["investigation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investigations")
        .select("*, sources(id, code, title, author, published_at, source_type, url, content, is_demo, status)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return {
        ...data,
        analysis: data.analysis as unknown as Analysis | null,
        sources: ((data.sources ?? []) as SourceRow[]).sort((a, b) => a.code.localeCompare(b.code)),
      };
    },
  });

export function nextSourceCode(existing: string[]): string {
  const max = existing.reduce((m, c) => Math.max(m, Number(c.replace(/\D/g, "")) || 0), 0);
  return `SRC-${String(max + 1).padStart(3, "0")}`;
}
