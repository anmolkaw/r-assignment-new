"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { MODULE_1_SAMPLE_INPUT, PRIMARY_CATEGORIES } from "@/lib/constants";
import type { Module1Output, ProductRun, RunStatus } from "@/lib/types";
import { module1RequestSchema, type Module1Request } from "@/lib/validators/module1";
import { fetcher } from "@/lib/utils/fetcher";
import { formatDate } from "@/lib/utils/format";

type Module1FormState = {
  productName: string;
  description: string;
  material: string;
  useCase: string;
  brand: string;
  sourceCountry: string;
  packagingNotes: string;
};

const initialForm: Module1FormState = {
  productName: "",
  description: "",
  material: "",
  useCase: "",
  brand: "",
  sourceCountry: "",
  packagingNotes: ""
};

export default function Module1Page() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState<Module1FormState>(initialForm);
  const [lastPayload, setLastPayload] = useState<Module1Request | null>(null);
  const [result, setResult] = useState<Module1Output | null>(null);
  const [runInfo, setRunInfo] = useState<{ runId: string; model: string; status: RunStatus } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const historyQuery = useQuery({
    queryKey: ["module1-history"],
    queryFn: () => fetcher<{ runs: ProductRun[] }>("/api/module1/history?limit=8"),
    enabled: mounted
  });

  const showHistoryLoading = !mounted || historyQuery.isLoading;
  const historyErrorMessage =
    historyQuery.error instanceof Error ? historyQuery.error.message : "Unable to load module history.";

  const mutation = useMutation({
    mutationFn: (payload: Module1Request) =>
      fetcher<{
        runId: string;
        model: string;
        status: RunStatus;
        output: Module1Output;
      }>("/api/module1/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
    onSuccess: (data, variables) => {
      setResult(data.output);
      setRunInfo({ runId: data.runId, model: data.model, status: data.status });
      setLastPayload(variables);
      toast.success("Module 1 run completed and saved.");
      queryClient.invalidateQueries({ queryKey: ["module1-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Module 1 run failed");
    }
  });
  const mutationErrorMessage =
    mutation.error instanceof Error ? mutation.error.message : "Module 1 run failed. Please try again.";

  const categories = useMemo(() => PRIMARY_CATEGORIES, []);

  function updateField<K extends keyof Module1FormState>(key: K, value: Module1FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = module1RequestSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please fix form inputs");
      return;
    }

    mutation.mutate(parsed.data);
  }

  function loadSavedRun(run: ProductRun) {
    if (!run.parsedOutputJson) {
      toast.error("This run has no saved output to preview.");
      return;
    }

    setResult(run.parsedOutputJson);
    setRunInfo({
      runId: run.id,
      model: "saved-history-run",
      status: run.status
    });
    toast.success("Loaded saved Module 1 output.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Module 1: Auto-Category & Tag Generator"
        description="Classify sustainable products into predefined categories, suggest sub-categories, SEO tags, and sustainability filters."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setForm(MODULE_1_SAMPLE_INPUT)}>
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

      <AnimatedContainer>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Category Whitelist</CardTitle>
            <CardDescription>Business rule enforcement maps AI output to this approved list.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </AnimatedContainer>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <AnimatedContainer delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Input</CardTitle>
              <CardDescription>
                Required fields are validated with Zod before request submission. Output is enforced against category/tag/filter business rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={form.productName}
                      onChange={(event) => updateField("productName", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={form.material}
                      onChange={(event) => updateField("material", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useCase">Use Case</Label>
                  <Input
                    id="useCase"
                    value={form.useCase}
                    onChange={(event) => updateField("useCase", event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand (optional)</Label>
                    <Input id="brand" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCountry">Country/Source (optional)</Label>
                    <Input
                      id="sourceCountry"
                      value={form.sourceCountry}
                      onChange={(event) => updateField("sourceCountry", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packagingNotes">Packaging Notes (optional)</Label>
                    <Input
                      id="packagingNotes"
                      value={form.packagingNotes}
                      onChange={(event) => updateField("packagingNotes", event.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={mutation.isPending}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {mutation.isPending ? "Generating..." : "Generate Category & Tags"}
                </Button>
              </form>

              {mutation.isError ? (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" /> Generation failed
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
              <CardTitle className="text-lg">Recent Module 1 Runs</CardTitle>
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
                  <p className="text-sm font-medium">Failed to load recent runs</p>
                  <p className="text-xs text-muted-foreground">{historyErrorMessage}</p>
                  <Button variant="outline" size="sm" onClick={() => historyQuery.refetch()}>
                    Retry
                  </Button>
                </div>
              ) : historyQuery.data?.runs?.length ? (
                historyQuery.data.runs.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => loadSavedRun(run)}
                    className="w-full rounded-lg border border-border/60 bg-background/40 p-3 text-left transition-colors hover:bg-background/65"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">{run.productName}</p>
                      <StatusBadge status={run.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(run.createdAt)}</p>
                    {run.parsedOutputJson?.primaryCategory ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {run.parsedOutputJson.primaryCategory} • {run.parsedOutputJson.subCategory}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-primary/80">Click to load saved output</p>
                  </button>
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
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classification Result</CardTitle>
                <CardDescription>Run ID: {runInfo?.runId} | Model: {runInfo?.model}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>Primary: {result.primaryCategory}</Badge>
                  <Badge variant="secondary">Sub: {result.subCategory}</Badge>
                  <Badge variant="outline">{result.seoTags.length} SEO Tags</Badge>
                  <Badge variant="outline">{result.sustainabilityFilters.length} Filters</Badge>
                  {runInfo ? <StatusBadge status={runInfo.status} /> : null}
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">SEO Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {result.seoTags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Sustainability Filters</p>
                  <div className="flex flex-wrap gap-2">
                    {result.sustainabilityFilters.map((filter) => (
                      <Badge key={filter}>{filter}</Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-background/50 p-3 text-sm text-muted-foreground">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                  {result.reasoningNotes ? <p className="mt-2">{result.reasoningNotes}</p> : null}
                </div>
              </CardContent>
            </Card>

            <JsonViewer value={result} title="Module 1 Structured Output" />
          </div>
        </AnimatedContainer>
      ) : (
        <AnimatedContainer delay={0.2}>
          <Card className="border-dashed border-border/70">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">No output generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Load the sample input or submit a product brief to preview structured classification JSON.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}
    </div>
  );
}
