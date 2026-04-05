import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/types";

const statusColor: Record<RunStatus, string> = {
  SUCCESS: "bg-emerald-500/20 text-emerald-400 border-emerald-400/40",
  FAILURE: "bg-red-500/20 text-red-400 border-red-400/40",
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-400/40"
};

export function StatusBadge({ status }: { status: RunStatus }) {
  return <Badge className={cn("border", statusColor[status])}>{status}</Badge>;
}
