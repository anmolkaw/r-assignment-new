import { getDashboardStats } from "@/lib/db/repositories";
import { errorResponse, successResponse } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
