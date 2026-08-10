import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, CACHE_TTL, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const locations = await getCached(
      CACHE_KEYS.locations(),
      CACHE_TTL.FIFTEEN_MINUTES,
      async () => {
        return await prisma.location.findMany({
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

    return apiSuccess(locations, {
      meta: { count: locations.length },
    });
  } catch (error) {
    console.error("GET /api/v1/locations error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to fetch locations", {
      status: 500,
    });
  }
}
