import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-muted text-muted-foreground",
  analyzing: "bg-primary-soft text-primary",
  processing: "bg-primary-soft text-primary",
  complete: "bg-success-soft text-success",
  processed: "bg-success-soft text-success",
  failed: "bg-destructive-soft text-destructive",
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-destructive-soft text-destructive",
  medium: "bg-warning-soft text-warning",
  low: "bg-muted text-muted-foreground",
  moderate: "bg-primary-soft text-primary",
  limited: "bg-warning-soft text-warning",
  none: "bg-destructive-soft text-destructive",
  genuine: "bg-destructive-soft text-destructive",
  apparent: "bg-warning-soft text-warning",
  complementary: "bg-success-soft text-success",
  inconclusive: "bg-muted text-muted-foreground",
  recent: "bg-success-soft text-success",
  aging: "bg-warning-soft text-warning",
  potentially_outdated: "bg-destructive-soft text-destructive",
  fact: "bg-secondary text-secondary-foreground",
  finding: "bg-primary-soft text-primary",
  prediction: "bg-warning-soft text-warning",
  interpretation: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize", tones[status] ?? tones["draft"], className)}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
