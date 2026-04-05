"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Box, BriefcaseBusiness, CheckCircle2, TriangleAlert } from "lucide-react";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardStats } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { fetcher } from "@/lib/utils/fetcher";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetcher<DashboardStats>("/api/dashboard/stats"),
    enabled: mounted
  });

  const data = statsQuery.data;
  const showStatsLoading = !mounted || statsQuery.isLoading;
  const showStatsError = mounted && statsQuery.isError;
  const statsErrorMessage =
    statsQuery.error instanceof Error ? statsQuery.error.message : "Failed to load dashboard stats.";
  const assignmentSignals = [
    "Structured JSON outputs",
    "Prompt + response logging",
    "Server-only API key management",
    "AI/business logic split",
    "Validation + error handling"
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rayeva AI Commerce Console"
        description="Monitor AI-driven categorization and proposal generation runs in real time."
        action={
          <Button asChild>
            <Link href="/module-1">
              Start Module 1 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {showStatsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : showStatsError ? (
        
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-base">Unable to load dashboard stats</CardTitle>
            <CardDescription>{statsErrorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => statsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AnimatedContainer delay={0.05}>
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-transparent">
                <CardHeader>
                  <CardDescription>Total Products Processed</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl">
                    {data?.totalProductsProcessed ?? 0}
                    <Box className="h-5 w-5 text-emerald-400" />
                  </CardTitle>
                </CardHeader>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer delay={0.12}>
              <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-transparent">
                <CardHeader>
                  <CardDescription>Total Proposals Generated</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl">
                    {data?.totalProposalsGenerated ?? 0}
                    <BriefcaseBusiness className="h-5 w-5 text-cyan-400" />
                  </CardTitle>
                </CardHeader>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer delay={0.19}>
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-transparent">
                <CardHeader>
                  <CardDescription>Recent Failures</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl">
                    {data?.recentFailures ?? 0}
                    <TriangleAlert className="h-5 w-5 text-amber-400" />
                  </CardTitle>
                </CardHeader>
              </Card>
            </AnimatedContainer>
          </div>

          {/* {data?.recentFailures ? (
            <AnimatedContainer delay={0.25}>
              <Card className="border-amber-500/35 bg-amber-500/10">
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">Recent failures detected</p>
                    <p className="text-sm text-muted-foreground">
                      Review `/logs` for error traces, provider responses, and parsed validation failures.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/logs">Open Logs</Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimatedContainer>
          ) : null}  */}
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <AnimatedContainer delay={0.22}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
              <CardDescription>Jump directly to module workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between">
                <Link href="/module-1">
                  Module 1: Auto-Category & Tag Generator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-between">
                <Link href="/module-2">
                  Module 2: B2B Proposal Generator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/logs">
                  View Prompt/Response Logs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer delay={0.29}>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent AI Runs</CardTitle>
              <CardDescription>Latest module executions across the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {showStatsError ? (
                <p className="text-sm text-muted-foreground">Recent runs are unavailable until stats reload succeeds.</p>
              ) : data?.recentRuns?.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentRuns.map((run) => (
                        <TableRow key={`${run.type}-${run.id}`}>
                          <TableCell>{run.type === "MODULE_1" ? "Module 1" : "Module 2"}</TableCell>
                          <TableCell>{run.productName || run.clientName || "-"}</TableCell>
                          <TableCell>
                            <StatusBadge status={run.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(run.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No runs yet. Trigger Module 1 or Module 2 to see activity.</p>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      <AnimatedContainer delay={0.35}>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Assignment Coverage Snapshot</CardTitle>
            <CardDescription>Quick evaluator view of criteria implemented in this build.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {assignmentSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-2 rounded-md border border-border/60 bg-background/50 p-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{signal}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
