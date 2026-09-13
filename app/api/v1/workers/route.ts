import { z, ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, CACHE_TTL, clearCache, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/modules/auth";

import { generateWorkerSlug } from "@/lib/slug";

export const runtime = "nodejs";

const createWorkerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(11, "Please enter a valid phone number"),
  secondaryPhone: z.string().optional().or(z.literal("")),
  secondary_phone: z.string().optional().or(z.literal("")),
  serviceType: z.string().optional(),
  serviceTypes: z.array(z.string()).optional(),
  city: z.string().optional(),
  zilla: z.string().optional().or(z.literal("")),
  upazila: z.string().optional().or(z.literal("")),
  village: z.string().optional().or(z.literal("")),
  divisionId: z.string().optional().or(z.literal("")),
  districtId: z.string().optional().or(z.literal("")),
  upazilaId: z.string().optional().or(z.literal("")),
  unionId: z.string().optional().or(z.literal("")),
  cityAreaId: z.string().optional().or(z.literal("")),
  coverageScope: z.enum(["SPECIFIC_AREA", "ALL_UPAZILA", "ALL_DISTRICT", "ALL_DIVISION", "NATIONWIDE"]).optional(),
  experience: z.union([z.number(), z.string()]).default(1),
  details: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const city = searchParams.get("city") ?? undefined;
    const statusParam = searchParams.get("status") ?? "APPROVED";

    const cacheKey = CACHE_KEYS.workersList(category, city, statusParam);

    const workers = await getCached(cacheKey, CACHE_TTL.FIVE_MINUTES, async () => {
      const whereCondition: any = {};
      if (statusParam !== "ALL") {
        whereCondition.status = statusParam as any;
      }
      if (category) {
        whereCondition.workerCategories = {
          some: {
            category: {
              OR: [
                { slug: category },
                { name: { equals: category, mode: "insensitive" } },
              ],
            },
          },
        };
      }
      if (city) {
        whereCondition.OR = [
          { divisionRef: { title_en: { equals: city, mode: "insensitive" } } },
          { districtRef: { title_en: { equals: city, mode: "insensitive" } } },
        ];
      }

      const rawWorkers = await prisma.workerProfile.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        include: {
          workerCategories: {
            select: {
              category: {
                select: { id: true, name: true, name_bn: true, slug: true, icon: true },
              },
            },
          },
          divisionRef: { select: { id: true, title_bn: true, title_en: true } },
          districtRef: { select: { id: true, title_bn: true, title_en: true } },
          upazilaRef: { select: { id: true, title_bn: true, title_en: true } },
          unionRef: { select: { id: true, title_bn: true, title_en: true } },
          cityAreaRef: { select: { id: true, title_bn: true, title_en: true, parent_thana: true } },
        },
      });

      return rawWorkers.map((w) => {
        const categories = w.workerCategories.map((wc) => wc.category);
        const city = w.divisionRef?.title_en || w.divisionRef?.title_bn || "Bangladesh";
        const zilla = w.districtRef?.title_en || w.districtRef?.title_bn || null;
        const upazila = w.cityAreaRef?.title_en || w.upazilaRef?.title_en || w.upazilaRef?.title_bn || null;
        const village = w.unionRef?.title_en || w.unionRef?.title_bn || null;
        return {
          ...w,
          city,
          zilla,
          upazila,
          village,
          categories,
          category: categories[0] ?? null,
          service_type: categories.map((c) => c.name).join(", "),
        };
      });
    });

    return apiSuccess(workers, {
      meta: { count: workers.length },
    });
  } catch (error) {
    console.error("GET /api/v1/workers error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to fetch workers", {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const sessionUser = await getSessionUser(authHeader);

    if (!sessionUser) {
      return apiError("UNAUTHORIZED", "Please sign in to register your worker profile", {
        status: 401,
      });
    }

    // Check if this user already has a worker profile
    const existingUserWorker = await prisma.workerProfile.findUnique({
      where: { fk_user_id: sessionUser.id },
    });
    if (existingUserWorker) {
      return apiError("CONFLICT", "You already have a registered worker profile under this account", {
        status: 409,
      });
    }

    const body = await request.json();
    const payload = createWorkerSchema.parse(body);

    // Generate unique slug for profile
    let slug = generateWorkerSlug(payload.fullName, payload.serviceType);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.workerProfile.findUnique({ where: { slug } });
      if (!existing) break;
      slug = generateWorkerSlug(payload.fullName, payload.serviceType);
      attempts++;
    }

    // Parse multiple service trades / categories
    const requestedTrades: string[] =
      payload.serviceTypes && payload.serviceTypes.length > 0
        ? payload.serviceTypes
        : (payload.serviceType || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    // Fetch all active categories to match requested trades
    const allCategories = await prisma.category.findMany();
    const matchedCategoryIds: number[] = [];
    const matchedServiceTypes: string[] = [];

    for (const trade of requestedTrades) {
      const lower = trade.toLowerCase().trim();
      const slug = lower.replace(/\s+/g, "-");
      const matched = allCategories.find(
        (c) =>
          c.name.toLowerCase() === lower ||
          c.slug.toLowerCase() === slug ||
          (c.name_bn && trade.includes(c.name_bn))
      );
      if (matched) {
        if (!matchedCategoryIds.includes(matched.id)) {
          matchedCategoryIds.push(matched.id);
          matchedServiceTypes.push(matched.name);
        }
      } else {
        if (!matchedServiceTypes.includes(trade)) {
          matchedServiceTypes.push(trade);
        }
      }
    }

    const primaryCategoryId = matchedCategoryIds[0] ?? null;

    // Verify location FKs before assigning to avoid FK violation crash
    const validDivision = payload.divisionId
      ? await prisma.division.findUnique({ where: { id: payload.divisionId }, select: { id: true } })
      : null;
    const validDistrict = payload.districtId
      ? await prisma.district.findUnique({ where: { id: payload.districtId }, select: { id: true } })
      : null;
    const validUpazila = payload.upazilaId
      ? await prisma.upazila.findUnique({ where: { id: payload.upazilaId }, select: { id: true } })
      : null;
    const validUnion = payload.unionId
      ? await prisma.union.findUnique({ where: { id: payload.unionId }, select: { id: true } })
      : null;
    const validCityArea = payload.cityAreaId
      ? await prisma.cityArea.findUnique({ where: { id: payload.cityAreaId }, select: { id: true } })
      : null;

    const expNum =
      typeof payload.experience === "number"
        ? payload.experience
        : parseInt(String(payload.experience).replace(/[^0-9]/g, "")) || 1;

    const worker = await prisma.workerProfile.create({
      data: {
        fk_user_id: sessionUser.id,
        full_name: payload.fullName,
        email: payload.email || sessionUser.email,
        phone: payload.phone,
        secondary_phone: payload.secondaryPhone || payload.secondary_phone || null,
        slug,
        workerCategories: {
          create: matchedCategoryIds.map((catId) => ({
            category: { connect: { id: catId } },
          })),
        },
        fk_division_id: validDivision?.id ?? null,
        fk_district_id: validDistrict?.id ?? null,
        fk_upazila_id: validUpazila?.id ?? null,
        fk_union_id: validUnion?.id ?? null,
        fk_city_area_id: validCityArea?.id ?? null,
        coverage_scope: payload.coverageScope ?? "SPECIFIC_AREA",
        experience: expNum,
        details: payload.details ?? null,
        status: "PENDING",
      },
      include: {
        divisionRef: true,
        districtRef: true,
        upazilaRef: true,
        unionRef: true,
        cityAreaRef: true,
      },
    });

    // Update user role to WORKER if currently USER
    if (sessionUser.role === "USER") {
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { role: "WORKER" },
      });
    }

    // Invalidate worker list cache
    clearCache();

    return apiSuccess(worker, {
      status: 201,
      meta: {
        message: "Worker profile registered successfully and pending approval.",
      },
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return apiError("BAD_REQUEST", error.issues?.[0]?.message || "Invalid input", {
        status: 400,
      });
    }
    console.error("POST /api/v1/workers error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to register worker profile", {
      status: 500,
    });
  }
}
