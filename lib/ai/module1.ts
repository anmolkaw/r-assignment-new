import { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } from "@/lib/constants";
import { module1AiOutputSchema, type Module1Request } from "@/lib/validators/module1";
import { getOpenAIClient, getOpenAIModel, getOpenAITimeoutMs } from "@/lib/ai/client";
import { AiServiceError, type AiGenerationResult } from "@/lib/ai/types";
import { safeJsonParse } from "@/lib/utils/safe-json";

const module1JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    primaryCategory: {
      type: "string",
      description: "Primary category from the provided category list"
    },
    subCategory: {
      type: "string",
      description: "Specific sub-category suggestion"
    },
    seoTags: {
      type: "array",
      minItems: 5,
      maxItems: 10,
      items: { type: "string" }
    },
    sustainabilityFilters: {
      type: "array",
      minItems: 1,
      maxItems: 7,
      items: {
        type: "string"
      }
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    reasoningNotes: {
      type: "string"
    }
  },
  required: [
    "primaryCategory",
    "subCategory",
    "seoTags",
    "sustainabilityFilters",
    "confidence",
    "reasoningNotes"
  ]
} as const;

export function buildModule1Prompt(input: Module1Request) {
  return [
    "You are an AI categorization specialist for sustainable B2B commerce.",
    "Return only valid JSON that matches the provided JSON schema.",
    `Allowed primary categories: ${PRIMARY_CATEGORIES.join(", ")}`,
    `Allowed sustainability filters: ${SUSTAINABILITY_FILTERS.join(", ")}`,
    "Keep SEO tags practical, search friendly, and non-duplicative.",
    "Input JSON:",
    JSON.stringify(input, null, 2)
  ].join("\n\n");
}

export async function generateModule1AiOutput(
  input: Module1Request
): Promise<AiGenerationResult<ReturnType<typeof module1AiOutputSchema.parse>>> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const prompt = buildModule1Prompt(input);

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
            name: "module1_structured_output",
            strict: true,
            schema: module1JsonSchema
          }
        },
        messages: [
          {
            role: "system",
            content:
              "You classify and tag sustainable products. Always respond with strict schema-compliant JSON."
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

    const validated = module1AiOutputSchema.parse(parsed);

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
