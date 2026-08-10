import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, CACHE_TTL, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getCached(
      CACHE_KEYS.categories(),
      CACHE_TTL.FIFTEEN_MINUTES,
      async () => {
        return await prisma.category.findMany({
          where: { is_active: true },
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { workers: true },
            },
          },
        });
      }
    );

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
