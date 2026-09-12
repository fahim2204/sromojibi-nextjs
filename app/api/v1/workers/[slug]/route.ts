import { z, ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, CACHE_TTL, clearCache, deleteCache, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Props = {
  params: { slug: string };
};

const updateWorkerSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  is_verified: z.boolean().optional(),
});

export async function GET(request: Request, { params }: Props) {
  try {
    const slug = params.slug;
    if (!slug) {
      return apiError("INVALID_INPUT", "Worker slug is required", { status: 400 });
    }

    const worker = await getCached(
      CACHE_KEYS.workerBySlug(slug),
      CACHE_TTL.FIVE_MINUTES,
      async () => {
        return await prisma.workerProfile.findUnique({
          where: { slug },
          include: {
            category: {
              select: { name: true, name_bn: true, slug: true, icon: true },
            },
            districtRef: {
              select: { title: true, title_en: true, title_bn: true },
            },
            upazilaRef: {
              select: { title_en: true, title_bn: true },
            },
            cityAreaRef: {
              select: { title_en: true, title_bn: true },
            },
            reviews: {
              orderBy: { created_at: "desc" },
              take: 10,
            },
          },
        });
      }
    );

    if (!worker) {
      return apiError("NOT_FOUND", "Worker profile not found", { status: 404 });
    }

    return apiSuccess(worker);
  } catch (error) {
    console.error("GET /api/v1/workers/[slug] error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to fetch worker profile", {
      status: 500,
    });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const slug = params.slug;
    if (!slug) {
      return apiError("INVALID_INPUT", "Worker slug is required", { status: 400 });
    }

    const worker = await prisma.workerProfile.findUnique({
      where: { slug },
    });

    if (!worker) {
      return apiError("NOT_FOUND", "Worker profile not found", { status: 404 });
    }

    const body = await request.json();
    const payload = updateWorkerSchema.parse(body);

    const updatedWorker = await prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        ...(payload.status ? { status: payload.status } : {}),
        ...(typeof payload.is_verified === "boolean" ? { is_verified: payload.is_verified } : {}),
      },
    });

    // Clear cache
    deleteCache(CACHE_KEYS.workerBySlug(slug));
    clearCache();

    return apiSuccess(updatedWorker, {
      meta: {
        message: `Worker profile status updated to ${updatedWorker.status}.`,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(
        "INVALID_INPUT",
        error.issues[0]?.message ?? "Invalid update payload",
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return apiError("INVALID_INPUT", "Invalid JSON request body", { status: 400 });
    }

    console.error("PATCH /api/v1/workers/[slug] error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to update worker profile", {
      status: 500,
    });
  }
}
