import { getRecentProductRuns } from "@/lib/db/repositories";
import { errorResponse, successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") || "10");
    const limit = Number.isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 50);

    const runs = await getRecentProductRuns(limit);

    return successResponse({ runs });
  } catch (error) {
    return errorResponse(error);
  }
}
