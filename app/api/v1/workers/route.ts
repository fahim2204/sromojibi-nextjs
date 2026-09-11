import { z, ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, CACHE_TTL, clearCache, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/modules/auth";

export const runtime = "nodejs";

const createWorkerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(11, "Please enter a valid phone number"),
  serviceType: z.string().min(2, "Please select a service category"),
  city: z.string().min(2, "Please select a city"),
  zilla: z.string().optional().or(z.literal("")),
  upazila: z.string().optional().or(z.literal("")),
  village: z.string().optional().or(z.literal("")),
  divisionId: z.string().optional().or(z.literal("")),
  districtId: z.string().optional().or(z.literal("")),
  upazilaId: z.string().optional().or(z.literal("")),
  unionId: z.string().optional().or(z.literal("")),
  experience: z.string().min(1, "Please select your experience level"),
  details: z.string().optional(),
});

function generateSlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${randomSuffix}`;
}

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
        whereCondition.OR = [
          { service_type: { equals: category, mode: "insensitive" } },
          { category: { slug: category } },
        ];
      }
      if (city) {
        whereCondition.city = { equals: city, mode: "insensitive" };
      }

      return await prisma.workerProfile.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        include: {
          category: {
            select: { name: true, name_bn: true, slug: true, icon: true },
          },
          location: {
            select: { name: true, name_bn: true, slug: true },
          },
          divisionRef: { select: { id: true, title_bn: true, title_en: true } },
          districtRef: { select: { id: true, title_bn: true, title_en: true } },
          upazilaRef: { select: { id: true, title_bn: true, title_en: true } },
          unionRef: { select: { id: true, title_bn: true, title_en: true } },
        },
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
    let slug = generateSlug(payload.fullName);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.workerProfile.findUnique({ where: { slug } });
      if (!existing) break;
      slug = generateSlug(payload.fullName);
      attempts++;
    }

    const categorySlug = payload.serviceType.toLowerCase().replace(/\s+/g, "-");
    const locationSlug = payload.city.toLowerCase().replace(/\s+/g, "-");

    const categoryRecord = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    const locationRecord = await prisma.location.findUnique({
      where: { slug: locationSlug },
    });

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

    const worker = await prisma.workerProfile.create({
      data: {
        fk_user_id: sessionUser.id,
        full_name: payload.fullName,
        email: payload.email || sessionUser.email,
        phone: payload.phone,
        slug,
        service_type: payload.serviceType,
        city: payload.city,
        zilla: payload.zilla || null,
        upazila: payload.upazila || null,
        village: payload.village || null,
        fk_division_id: validDivision?.id ?? null,
        fk_district_id: validDistrict?.id ?? null,
        fk_upazila_id: validUpazila?.id ?? null,
        fk_union_id: validUnion?.id ?? null,
        experience: payload.experience,
        details: payload.details ?? null,
        status: "PENDING",
        fk_category_id: categoryRecord?.id ?? null,
        fk_location_id: locationRecord?.id ?? null,
      },
      include: {
        divisionRef: true,
        districtRef: true,
        upazilaRef: true,
        unionRef: true,
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
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(
        "INVALID_INPUT",
        error.issues[0]?.message ?? "Invalid worker profile data",
        { status: 400 }
      );
    }

    console.error("POST /api/v1/workers error:", error);
    const detailMsg = error instanceof Error ? error.message : "Failed to create worker profile";
    return apiError("INTERNAL_SERVER_ERROR", detailMsg, {
      status: 500,
    });
  }
}
