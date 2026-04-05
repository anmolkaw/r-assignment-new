import { AnimatedContainer } from "@/components/shared/animated-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Module 3 & 4 Architecture"
        description="Documented implementation blueprint for AI Impact Reporting Generator and AI WhatsApp Support Bot."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatedContainer>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Module 3: AI Impact Reporting Generator (Architecture)</CardTitle>
              <CardDescription>Order-linked sustainability and impact report generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Data Flow: Order + line-items + supplier sustainability metadata to AI summarization service to structured report JSON to PDF renderer and dashboard storage.
              </p>
              <p>
                Proposed Endpoints: `POST /api/module3/report`, `GET /api/module3/report/:id`, `GET /api/module3/history`.
              </p>
              <p>
                Schema Ideas: emissions estimate, packaging reduction metrics, recycled/compostable ratio, source traceability summary, audit notes.
              </p>
              <p>
                AI/Business Split: AI drafts narrative + recommendations; business layer computes deterministic metrics and validates claims before publishing.
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>

        <AnimatedContainer delay={0.08}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Module 4: AI WhatsApp Support Bot (Architecture)</CardTitle>
              <CardDescription>Operational support bot with escalation logic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Data Flow: WhatsApp webhook to intent detection and policy guardrails to AI response composer to CRM or ticket update with optional human escalation.
              </p>
              <p>
                Proposed Endpoints: `POST /api/module4/webhook`, `POST /api/module4/escalate`, `GET /api/module4/conversations/:id`.
              </p>
              <p>
                Escalation Logic: auto-escalate on procurement disputes, refund requests, low-confidence answers, or repeated unresolved queries within a conversation.
              </p>
              <p>
                AI/Business Split: AI handles language and intent abstraction; business layer enforces policy, order context checks, and handoff thresholds.
              </p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      </div>

      <AnimatedContainer delay={0.16}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shared Implementation Plan</CardTitle>
            <CardDescription>Cross-module standards for Module 3 and Module 4 when implementation starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Structured JSON Outputs</Badge>
              <Badge variant="secondary">Prompt + Response Logging</Badge>
              <Badge variant="secondary">Zod Validation</Badge>
              <Badge variant="secondary">Server-side Env Handling</Badge>
              <Badge variant="secondary">Deterministic Business Rules</Badge>
            </div>
            <p>
              Proposed data stores: `ImpactReportRun`, `WhatsAppConversation`, `WhatsAppMessage`, and `EscalationEvent` with
              the same success/failure traceability pattern used by Module 1 and Module 2.
            </p>
            <p>
              Operational guardrails: queue retries for webhook/report jobs, confidence thresholds for human handoff, and
              audit fields for every generated claim shown to business users.
            </p>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
}
