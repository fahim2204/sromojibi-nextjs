import { apiError, apiSuccess } from "@/lib/api-response";
import { getCategories } from "@/services/categoryService";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getCategories();

    return apiSuccess(categories, {
      meta: { count: categories.length },
    });
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to fetch worker categories", {
      status: 500,
    });
  }
}
