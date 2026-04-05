"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { JsonViewer } from "@/components/shared/json-viewer";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MODULE_2_SAMPLE_INPUT } from "@/lib/constants";
import type { Module2Output, ProposalRun, RunStatus } from "@/lib/types";
import { module2RequestSchema } from "@/lib/validators/module2";
import { fetcher } from "@/lib/utils/fetcher";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type Module2FormState = {
  clientName: string;
  industry: string;
  clientGoals: string;
  budgetLimit: string;
  sustainabilityFocus: string;
  preferredCategories: string;
  quantityNeeds: string;
  notes: string;
};

const initialForm: Module2FormState = {
  clientName: "",
  industry: "",
  clientGoals: "",
  budgetLimit: "",
  sustainabilityFocus: "",
  preferredCategories: "",
  quantityNeeds: "",
  notes: ""
};

export default function Module2Page() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState<Module2FormState>(initialForm);
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<Module2Output | null>(null);
  const [runInfo, setRunInfo] = useState<{ runId: string; model: string; status: RunStatus } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const historyQuery = useQuery({
    queryKey: ["module2-history"],
    queryFn: () => fetcher<{ runs: ProposalRun[] }>("/api/module2/history?limit=8"),
    enabled: mounted
  });

  const showHistoryLoading = !mounted || historyQuery.isLoading;
  const historyErrorMessage =
    historyQuery.error instanceof Error ? historyQuery.error.message : "Unable to load proposal history.";

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      fetcher<{
        runId: string;
        model: string;
        status: RunStatus;
        output: Module2Output;
      }>("/api/module2/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
    onSuccess: (data, variables) => {
      setResult(data.output);
      setRunInfo({ runId: data.runId, model: data.model, status: data.status });
      setLastPayload(variables);
      toast.success("Module 2 proposal generated and saved.");
      queryClient.invalidateQueries({ queryKey: ["module2-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Module 2 run failed");
    }
  });
  const mutationErrorMessage =
    mutation.error instanceof Error ? mutation.error.message : "Module 2 proposal generation failed. Please try again.";

  const summaryText = useMemo(() => {
    if (!result) {
      return "";
    }

    return `Impact Summary: ${result.impactPositioningSummary}\nAllocated Budget: ${formatCurrency(
      result.budgetSummary.allocatedBudget
    )}\nRemaining Budget: ${formatCurrency(result.budgetSummary.remainingBudget)}`;
  }, [result]);

  function updateField<K extends keyof Module2FormState>(key: K, value: Module2FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function parsePayload() {
    const payload = {
      clientName: form.clientName,
      industry: form.industry,
      clientGoals: form.clientGoals,
      budgetLimit: Number(form.budgetLimit),
      sustainabilityFocus: form.sustainabilityFocus,
      preferredCategories: form.preferredCategories
        ? form.preferredCategories
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
      quantityNeeds: form.quantityNeeds,
      notes: form.notes
    };

    return module2RequestSchema.safeParse(payload);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parsePayload();
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please fix form inputs");
      return;
    }

    mutation.mutate(parsed.data);
  }

  function downloadJson() {
    if (!result) {
      return;
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `module-2-proposal-${runInfo?.runId || "result"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copySummary() {
    if (!summaryText) {
      return;
    }

    await navigator.clipboard.writeText(summaryText);
    toast.success("Summary copied");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Module 2: AI B2B Proposal Generator"
        description="Generate a sustainable product mix with budget-aware allocation and impact positioning summary."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setForm({
                  ...MODULE_2_SAMPLE_INPUT,
                  preferredCategories: MODULE_2_SAMPLE_INPUT.preferredCategories.join(", "),
                  budgetLimit: String(MODULE_2_SAMPLE_INPUT.budgetLimit)
                })
              }
            >
              <WandSparkles className="mr-2 h-4 w-4" /> Load Sample
            </Button>
            <Button
              variant="outline"
              onClick={() => lastPayload && mutation.mutate(lastPayload)}
              disabled={!lastPayload || mutation.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <AnimatedContainer delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Brief Input</CardTitle>
              <CardDescription>
                Budget, required fields, and payload shape are validated before request submission. Business rules rebalance totals to stay budget-safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client / Company Name</Label>
                    <Input id="clientName" value={form.clientName} onChange={(event) => updateField("clientName", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={form.industry} onChange={(event) => updateField("industry", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientGoals">Client Goals</Label>
                  <Textarea
                    id="clientGoals"
                    value={form.clientGoals}
                    onChange={(event) => updateField("clientGoals", event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budgetLimit">Budget Limit</Label>
                    <Input
                      id="budgetLimit"
                      type="number"
                      value={form.budgetLimit}
                      onChange={(event) => updateField("budgetLimit", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sustainabilityFocus">Preferred Sustainability Focus</Label>
                    <Input
                      id="sustainabilityFocus"
                      value={form.sustainabilityFocus}
                      onChange={(event) => updateField("sustainabilityFocus", event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredCategories">Preferred Categories (comma-separated)</Label>
                    <Input
                      id="preferredCategories"
                      value={form.preferredCategories}
                      onChange={(event) => updateField("preferredCategories", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantityNeeds">Quantity Needs (optional)</Label>
                    <Input
                      id="quantityNeeds"
                      value={form.quantityNeeds}
                      onChange={(event) => updateField("quantityNeeds", event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
                </div>

                <Button className="w-full" type="submit" disabled={mutation.isPending}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {mutation.isPending ? "Generating Proposal..." : "Generate Proposal"}
                </Button>
              </form>

              {mutation.isError ? (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" /> Proposal generation failed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{mutationErrorMessage}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer delay={0.12}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showHistoryLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : historyQuery.isError ? (
                <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                  <p className="text-sm font-medium">Failed to load proposal history</p>
                  <p className="text-xs text-muted-foreground">{historyErrorMessage}</p>
                  <Button variant="outline" size="sm" onClick={() => historyQuery.refetch()}>
                    Retry
                  </Button>
                </div>
              ) : historyQuery.data?.runs?.length ? (
                historyQuery.data.runs.map((run) => (
                  <div key={run.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">{run.clientName}</p>
                      <StatusBadge status={run.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{run.industry} • {formatDate(run.createdAt)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Budget: {formatCurrency(run.budgetLimit)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      {result ? (
        <AnimatedContainer delay={0.2}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">Proposal Output</CardTitle>
                    <CardDescription>Run ID: {runInfo?.runId} | Model: {runInfo?.model}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {runInfo ? <StatusBadge status={runInfo.status} /> : null}
                    <Button variant="outline" size="sm" onClick={copySummary}>
                      Copy Summary
                    </Button>
                    <Button size="sm" onClick={downloadJson}>
                      <Download className="mr-2 h-4 w-4" /> Download JSON
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Budget Limit</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.budgetSummary.budgetLimit)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Allocated Budget</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.budgetSummary.allocatedBudget)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Remaining Budget</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.budgetSummary.remainingBudget)}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.recommendedMix.map((item) => (
                        <TableRow key={`${item.productName}-${item.category}`}>
                          <TableCell className="font-medium">
                            <p>{item.productName}</p>
                            <p className="mt-1 text-xs font-normal text-muted-foreground">{item.reason}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(item.estimatedUnitCost)}</TableCell>
                          <TableCell>{item.recommendedQuantity}</TableCell>
                          <TableCell>{formatCurrency(item.estimatedTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Products Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.costBreakdown.productsTotal)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Estimated Shipping</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.costBreakdown.estimatedShipping)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Grand Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.costBreakdown.grandTotal)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="text-sm font-medium">Impact Positioning Summary</p>
                  <p className="mt-2 text-sm text-muted-foreground">{result.impactPositioningSummary}</p>
                </div>
              </CardContent>
            </Card>

            <JsonViewer value={result} title="Module 2 Structured Output" />
          </div>
        </AnimatedContainer>
      ) : (
        <AnimatedContainer delay={0.2}>
          <Card className="border-dashed border-border/70">
            <CardContent className="p-4">
              <p className="text-sm font-medium">No proposal generated yet</p>
              <p className="text-sm text-muted-foreground">
                Load the sample brief or submit a client request to preview budget allocation, cost breakdown, and impact summary.
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}
    </div>
  );
}
