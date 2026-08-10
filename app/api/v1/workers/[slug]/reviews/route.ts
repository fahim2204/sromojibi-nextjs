import { z, ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { CACHE_KEYS, deleteCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Props = {
  params: { slug: string };
};

const createReviewSchema = z.object({
  reviewerName: z.string().min(2, "Name must be at least 2 characters"),
  reviewerPhone: z.string().optional(),
  rating: z.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export async function POST(request: Request, { params }: Props) {
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
    const payload = createReviewSchema.parse(body);

    // Create review entry
    const review = await prisma.workerReview.create({
      data: {
        fk_worker_id: worker.id,
        reviewer_name: payload.reviewerName,
        reviewer_phone: payload.reviewerPhone ?? null,
        rating: payload.rating,
        comment: payload.comment ?? null,
      },
    });

    // Recalculate average rating and review count for worker
    const aggregations = await prisma.workerReview.aggregate({
      where: { fk_worker_id: worker.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const newAvg = aggregations._avg.rating ?? payload.rating;
    const newCount = aggregations._count.id;

    await prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        rating: newAvg,
        review_count: newCount,
      },
    });

    // Invalidate cache for worker by slug
    deleteCache(CACHE_KEYS.workerBySlug(slug));

    return apiSuccess(review, {
      status: 201,
      meta: {
        message: "Thank you! Your review has been submitted successfully.",
        newRating: newAvg,
        reviewCount: newCount,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(
        "INVALID_INPUT",
        error.issues[0]?.message ?? "Invalid review data",
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return apiError("INVALID_INPUT", "Invalid JSON request body", { status: 400 });
    }

    console.error("POST /api/v1/workers/[slug]/reviews error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to submit review", {
      status: 500,
    });
  }
}
