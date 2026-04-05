import { getGroqApiKeyDiagnostics } from "@/lib/ai/client";
import { successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = getGroqApiKeyDiagnostics();

  return successResponse({
    groqApiKeyConfigured: diagnostics.configured,
    normalizedFromPrefixedValue: diagnostics.normalizedFromPrefixedValue
  });
}
