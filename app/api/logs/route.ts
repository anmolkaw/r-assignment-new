import { getRecentLogs } from "@/lib/db/repositories";
import { errorResponse, successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") || "30");
    const limit = Number.isNaN(limitParam) ? 30 : Math.min(Math.max(limitParam, 1), 200);

    const logs = await getRecentLogs(limit);

    return successResponse({ logs });
  } catch (error) {
    return errorResponse(error);
  }
}
