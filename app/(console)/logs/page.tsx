"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prompt & Response Logs"
        description="Inspect module-level prompt logs, raw AI responses, parsed JSON, validation outcomes, and timestamps."
      />

      <AnimatedContainer>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent AI Logs</CardTitle>
          </CardHeader>
          <CardContent>
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
            ) : query.data?.logs?.length ? (
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
                  {query.data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.moduleType}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "outline"}>
                          {log.success ? "SUCCESS" : "FAILURE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.errorMessage || "-"}</TableCell>
                      <TableCell>
                        <details className="cursor-pointer text-xs">
                          <summary className="font-medium text-primary">View</summary>
                          <div className="mt-2 space-y-2 rounded-md bg-background/60 p-2">
                            <div>
                              <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Prompt</p>
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{log.prompt}</pre>
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Raw Response</p>
                              <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">{log.rawResponse || "-"}</pre>
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
            ) : (
              <p className="text-sm text-muted-foreground">No logs yet.</p>
            )}
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
