"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Box, BriefcaseBusiness, TriangleAlert } from "lucide-react";
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
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetcher<DashboardStats>("/api/dashboard/stats"),
    enabled: typeof window !== "undefined"
  });

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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
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
      )}

      <div className="grid gap-4 lg:grid-cols-2">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent AI Runs</CardTitle>
              <CardDescription>Latest module executions across the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.recentRuns?.length ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">No runs yet. Trigger Module 1 or Module 2 to see activity.</p>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>
    </div>
  );
}
