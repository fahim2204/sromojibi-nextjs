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
        const divs = await prisma.division.findMany({
          where: { row_status: 1 },
          orderBy: { title_en: "asc" },
          include: {
            _count: {
              select: { workers: true },
            },
          },
        });
        return divs.map((d) => ({
          id: d.id,
          name: d.title_en || d.title,
          name_bn: d.title_bn,
          slug: (d.title_en || d.title).toLowerCase().replace(/\s+/g, "-"),
          _count: d._count,
        }));
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
