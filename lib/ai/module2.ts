import { getOpenAIClient, getOpenAIModel, getOpenAITimeoutMs } from "@/lib/ai/client";
import { AiServiceError, type AiGenerationResult } from "@/lib/ai/types";
import { module2AiOutputSchema, type Module2Request } from "@/lib/validators/module2";
import { safeJsonParse } from "@/lib/utils/safe-json";

const module2JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendedMix: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          productName: { type: "string" },
          category: { type: "string" },
          estimatedUnitCost: { type: "number", minimum: 0 },
          recommendedQuantity: { type: "integer", minimum: 1 },
          estimatedTotal: { type: "number", minimum: 0 },
          reason: { type: "string" }
        },
        required: [
          "productName",
          "category",
          "estimatedUnitCost",
          "recommendedQuantity",
          "estimatedTotal",
          "reason"
        ]
      }
    },
    budgetSummary: {
      type: "object",
      additionalProperties: false,
      properties: {
        budgetLimit: { type: "number", minimum: 0 },
        allocatedBudget: { type: "number", minimum: 0 },
        remainingBudget: { type: "number" }
      },
      required: ["budgetLimit", "allocatedBudget", "remainingBudget"]
    },
    costBreakdown: {
      type: "object",
      additionalProperties: false,
      properties: {
        productsTotal: { type: "number", minimum: 0 },
        estimatedShipping: { type: "number", minimum: 0 },
        grandTotal: { type: "number", minimum: 0 }
      },
      required: ["productsTotal", "estimatedShipping", "grandTotal"]
    },
    impactPositioningSummary: {
      type: "string"
    }
  },
  required: ["recommendedMix", "budgetSummary", "costBreakdown", "impactPositioningSummary"]
} as const;

export function buildModule2Prompt(input: Module2Request) {
  return [
    "You are an AI B2B sustainability proposal strategist.",
    "Return only valid JSON matching the JSON schema.",
    "Create a practical sustainable product recommendation mix with realistic costs.",
    "Do not exceed the provided budget limit.",
    "Impact summary must be concise and executive-friendly (2-4 sentences).",
    "Input JSON:",
    JSON.stringify(input, null, 2)
  ].join("\n\n");
}

export async function generateModule2AiOutput(
  input: Module2Request
): Promise<AiGenerationResult<ReturnType<typeof module2AiOutputSchema.parse>>> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const prompt = buildModule2Prompt(input);

  const timeoutMs = getOpenAITimeoutMs();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const completion = await client.chat.completions.create(
      {
        model,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "module2_structured_output",
            strict: true,
            schema: module2JsonSchema
          }
        },
        messages: [
          {
            role: "system",
            content:
              "You generate business-ready sustainable procurement proposals. Always return strict schema JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        signal: controller.signal
      }
    );

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new AiServiceError("AI returned an empty response.", "BAD_RESPONSE");
    }

    const parsed = safeJsonParse<unknown>(content);
    if (!parsed) {
      throw new AiServiceError("AI response was not valid JSON.", "BAD_RESPONSE");
    }

    const validated = module2AiOutputSchema.parse(parsed);

    return {
      prompt,
      rawResponse: content,
      parsedResponse: validated,
      model: completion.model
    };
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }

    if ((error as Error)?.name === "AbortError") {
      throw new AiServiceError(`AI request timed out after ${timeoutMs}ms.`, "TIMEOUT");
    }

    throw new AiServiceError((error as Error)?.message || "Unknown AI error", "API_ERROR");
  } finally {
    clearTimeout(timeout);
  }
}
