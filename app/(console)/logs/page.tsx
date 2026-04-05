"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AiLogRecord } from "@/lib/types";
import { fetcher } from "@/lib/utils/fetcher";
import { formatDate } from "@/lib/utils/format";

export default function LogsPage() {
  const [mounted, setMounted] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<"ALL" | "MODULE_1" | "MODULE_2">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "FAILURE">("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const query = useQuery({
    queryKey: ["logs"],
    queryFn: () => fetcher<{ logs: AiLogRecord[] }>("/api/logs?limit=80"),
    enabled: mounted
  });

  const showLogsLoading = !mounted || query.isLoading;
  const logsErrorMessage =
    query.error instanceof Error ? query.error.message : "Unable to fetch logs at the moment.";
  const logs = useMemo(() => query.data?.logs ?? [], [query.data?.logs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const moduleMatches = moduleFilter === "ALL" ? true : log.moduleType === moduleFilter;
        const statusMatches =
          statusFilter === "ALL" ? true : statusFilter === "SUCCESS" ? log.success : !log.success;
        return moduleMatches && statusMatches;
      }),
    [logs, moduleFilter, statusFilter]
  );

  const successCount = logs.filter((log) => log.success).length;
  const failureCount = logs.length - successCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt & Response Logs"
        description="Inspect module-level prompt logs, raw AI responses, parsed JSON, validation outcomes, and timestamps."
      />

      <AnimatedContainer>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-semibold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Success</p>
              <p className="text-2xl font-semibold text-emerald-400">{successCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Failure</p>
              <p className="text-2xl font-semibold text-amber-400">{failureCount}</p>
            </CardContent>
          </Card>
        </div>
      </AnimatedContainer>

      <AnimatedContainer delay={0.06}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent AI Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={moduleFilter === "ALL" ? "default" : "outline"}
                onClick={() => setModuleFilter("ALL")}
              >
                All Modules
              </Button>
              <Button
                size="sm"
                variant={moduleFilter === "MODULE_1" ? "default" : "outline"}
                onClick={() => setModuleFilter("MODULE_1")}
              >
                Module 1
              </Button>
              <Button
                size="sm"
                variant={moduleFilter === "MODULE_2" ? "default" : "outline"}
                onClick={() => setModuleFilter("MODULE_2")}
              >
                Module 2
              </Button>

              <div className="mx-1 h-5 w-px bg-border/70" />

              <Button
                size="sm"
                variant={statusFilter === "ALL" ? "secondary" : "outline"}
                onClick={() => setStatusFilter("ALL")}
              >
                All Statuses
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "SUCCESS" ? "secondary" : "outline"}
                onClick={() => setStatusFilter("SUCCESS")}
              >
                Success
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "FAILURE" ? "secondary" : "outline"}
                onClick={() => setStatusFilter("FAILURE")}
              >
                Failure
              </Button>
            </div>

            {showLogsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : query.isError ? (
              <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <p className="text-sm font-medium">Failed to load logs</p>
                <p className="text-xs text-muted-foreground">{logsErrorMessage}</p>
                <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                  Retry
                </Button>
              </div>
            ) : filteredLogs.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.moduleType}</TableCell>
                        <TableCell>
                          <Badge variant={log.success ? "default" : "outline"}>
                            {log.success ? "SUCCESS" : "FAILURE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {log.errorMessage || "-"}
                        </TableCell>
                        <TableCell>
                          <details className="cursor-pointer text-xs">
                            <summary className="font-medium text-primary">View</summary>
                            <div className="mt-2 space-y-2 rounded-md bg-background/60 p-2">
                              <div>
                                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Prompt</p>
                                <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{log.prompt}</pre>
                              </div>
                              <div>
                                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Raw Response
                                </p>
                                <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">
                                  {log.rawResponse || "-"}
                                </pre>
                              </div>
                              <div>
                                <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Parsed JSON</p>
                                <pre className="max-h-32 overflow-auto text-[11px]">
                                  {log.parsedResponseJson ? JSON.stringify(log.parsedResponseJson, null, 2) : "-"}
                                </pre>
                              </div>
                            </div>
                          </details>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : logs.length ? (
              <p className="text-sm text-muted-foreground">No logs match the current filters.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No logs yet.</p>
            )}
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
