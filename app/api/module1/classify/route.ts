import { ModuleType, RunStatus } from "@prisma/client";
import { buildModule1Prompt, generateModule1AiOutput } from "@/lib/ai/module1";
import { applyModule1BusinessRules } from "@/lib/business/module1";
import {
  createAiLog,
  createProductRun,
  finalizeProductRun
} from "@/lib/db/repositories";
import { module1RequestSchema } from "@/lib/validators/module1";
import { errorResponse, parseJsonBody, successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let runId: string | null = null;
  let prompt = "";

  try {
    const rawBody = await parseJsonBody(request);
    const input = module1RequestSchema.parse(rawBody);

    prompt = buildModule1Prompt(input);

    const run = await createProductRun({
      productName: input.productName,
      inputJson: input,
      prompt
    });
    runId = run.id;

    const aiResult = await generateModule1AiOutput(input);
    const groundedOutput = applyModule1BusinessRules(input, aiResult.parsedResponse);

    await finalizeProductRun(run.id, {
      rawAiResponse: aiResult.rawResponse,
      parsedOutputJson: groundedOutput,
      status: RunStatus.SUCCESS
    });

    await createAiLog({
      moduleType: ModuleType.MODULE_1,
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
      await finalizeProductRun(runId, {
        status: RunStatus.FAILURE,
        errorMessage: error instanceof Error ? error.message : "Unknown module 1 error"
      }).catch(() => null);
    }

    await createAiLog({
      moduleType: ModuleType.MODULE_1,
      prompt,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown module 1 error"
    }).catch(() => null);

    return errorResponse(error);
  }
}
