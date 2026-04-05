import { ModuleType, RunStatus } from "@prisma/client";
import { buildModule2Prompt, generateModule2AiOutput } from "@/lib/ai/module2";
import { applyModule2BusinessRules } from "@/lib/business/module2";
import {
  createAiLog,
  createProposalRun,
  finalizeProposalRun
} from "@/lib/db/repositories";
import { module2RequestSchema } from "@/lib/validators/module2";
import { errorResponse, parseJsonBody, successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let runId: string | null = null;
  let prompt = "";

  try {
    const rawBody = await parseJsonBody(request);
    const bodyObject =
      typeof rawBody === "object" && rawBody !== null ? (rawBody as Record<string, unknown>) : {};

    const normalizedBody = {
      ...bodyObject,
      budgetLimit: Number(bodyObject.budgetLimit)
    };

    const input = module2RequestSchema.parse(normalizedBody);
    prompt = buildModule2Prompt(input);

    const run = await createProposalRun({
      clientName: input.clientName,
      industry: input.industry,
      budgetLimit: input.budgetLimit,
      inputJson: input,
      prompt
    });
    runId = run.id;

    const aiResult = await generateModule2AiOutput(input);
    const groundedOutput = applyModule2BusinessRules(input, aiResult.parsedResponse);

    await finalizeProposalRun(run.id, {
      rawAiResponse: aiResult.rawResponse,
      parsedOutputJson: groundedOutput,
      status: RunStatus.SUCCESS
    });

    await createAiLog({
      moduleType: ModuleType.MODULE_2,
      prompt: aiResult.prompt,
      rawResponse: aiResult.rawResponse,
      parsedResponseJson: groundedOutput,
      success: true
    });

    return successResponse({
      runId: run.id,
      model: aiResult.model,
      status: RunStatus.SUCCESS,
      output: groundedOutput,
      saved: true
    });
  } catch (error) {
    if (runId) {
      await finalizeProposalRun(runId, {
        status: RunStatus.FAILURE,
        errorMessage: error instanceof Error ? error.message : "Unknown module 2 error"
      }).catch(() => null);
    }

    await createAiLog({
      moduleType: ModuleType.MODULE_2,
      prompt,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown module 2 error"
    }).catch(() => null);

    return errorResponse(error);
  }
}
