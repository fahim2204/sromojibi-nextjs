import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_TTL, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

// Route for location hierarchy (Divisions, Districts, Upazilas, CityAreas, Unions)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district_id");
    const upazilaId = searchParams.get("upazila_id");
    const query = searchParams.get("q")?.trim();

    // 1. Search Query Mode (Division, District, or Upazila matching)
    if (query) {
      const cacheKey = `locations:search:${query.toLowerCase()}`;
      const searchResults = await getCached(
        cacheKey,
        CACHE_TTL.FIFTEEN_MINUTES,
        async () => {
          return await prisma.division.findMany({
            where: {
              OR: [
                { title_bn: { contains: query, mode: "insensitive" } },
                { title_en: { contains: query, mode: "insensitive" } },
                {
                  districts: {
                    some: {
                      OR: [
                        { title_bn: { contains: query, mode: "insensitive" } },
                        { title_en: { contains: query, mode: "insensitive" } },
                        {
                          upazilas: {
                            some: {
                              OR: [
                                { title_bn: { contains: query, mode: "insensitive" } },
                                { title_en: { contains: query, mode: "insensitive" } },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            orderBy: { id: "asc" },
            select: {
              id: true,
              title_bn: true,
              title_en: true,
              districts: {
                where: {
                  OR: [
                    { title_bn: { contains: query, mode: "insensitive" } },
                    { title_en: { contains: query, mode: "insensitive" } },
                    {
                      upazilas: {
                        some: {
                          OR: [
                            { title_bn: { contains: query, mode: "insensitive" } },
                            { title_en: { contains: query, mode: "insensitive" } },
                          ],
                        },
                      },
                    },
                  ],
                },
                orderBy: { title_en: "asc" },
                select: {
                  id: true,
                  title_bn: true,
                  title_en: true,
                  upazilas: {
                    orderBy: { title_bn: "asc" },
                    select: {
                      id: true,
                      title_bn: true,
                      title_en: true,
                    },
                  },
                },
              },
            },
          });
        }
      );

      return apiSuccess(searchResults);
    }

    // 2. Upazila Detail Mode (Fetch unions under specific upazila)
    if (upazilaId) {
      const cacheKey = `locations:upazila_unions:${upazilaId}`;
      const upazilaDetail = await getCached(
        cacheKey,
        CACHE_TTL.ONE_HOUR,
        async () => {
          return await prisma.upazila.findUnique({
            where: { id: upazilaId },
            select: {
              id: true,
              title_bn: true,
              title_en: true,
              unions: {
                orderBy: { title_bn: "asc" },
                select: {
                  id: true,
                  title_bn: true,
                  title_en: true,
                },
              },
            },
          });
        }
      );

      if (!upazilaDetail) {
        return apiError("NOT_FOUND", "Upazila not found", { status: 404 });
      }

      return apiSuccess(upazilaDetail);
    }

    // 3. District Detail Mode (Fetch upazilas under specific district)
    if (districtId) {
      const cacheKey = `locations:district_upazilas:${districtId}`;
      const districtDetail = await getCached(
        cacheKey,
        CACHE_TTL.ONE_HOUR,
        async () => {
          return await prisma.district.findUnique({
            where: { id: districtId },
            select: {
              id: true,
              title_bn: true,
              title_en: true,
              upazilas: {
                orderBy: { title_bn: "asc" },
                select: {
                  id: true,
                  title_bn: true,
                  title_en: true,
                },
              },
              city_areas: {
                where: { row_status: 1 },
                orderBy: { title_bn: "asc" },
                select: {
                  id: true,
                  title_bn: true,
                  title_en: true,
                  parent_thana: true,
                },
              },
            },
          });
        }
      );

      if (!districtDetail) {
        return apiError("NOT_FOUND", "District not found", { status: 404 });
      }

      return apiSuccess(districtDetail);
    }

    // 4. Default Overview Mode (Fetch all divisions & districts)
    const cacheKey = "locations:divisions_districts";
    const divisions = await getCached(
      cacheKey,
      CACHE_TTL.ONE_HOUR,
      async () => {
        return await prisma.division.findMany({
          orderBy: { id: "asc" },
          select: {
            id: true,
            title_bn: true,
            title_en: true,
            districts: {
              orderBy: { title_en: "asc" },
              select: {
                id: true,
                title_bn: true,
                title_en: true,
              },
            },
          },
        });
      }
    );

    return apiSuccess(divisions);
  } catch (error) {
    console.error("GET /api/v1/locations/hierarchy error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to fetch location hierarchy", {
      status: 500,
    });
  }
}
