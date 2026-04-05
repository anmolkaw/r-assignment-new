"use client";

import { Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JsonViewer({ value, title = "Structured JSON" }: { value: unknown; title?: string }) {
  const [copied, setCopied] = useState(false);
  const formatted = JSON.stringify(value, null, 2);

  async function copyJson() {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success("JSON copied");
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Card className="border-primary/20 bg-card/65">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button size="sm" variant="outline" onClick={copyJson}>
          {copied ? <CheckCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy JSON
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-background/70 p-4 text-xs leading-5 text-emerald-300">
          {formatted}
        </pre>
      </CardContent>
    </Card>
  );
}
