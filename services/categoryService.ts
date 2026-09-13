import { CACHE_KEYS, CACHE_TTL, getCached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export interface ApiCategory {
  id: number;
  name: string;
  name_bn: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  _count?: {
    workers: number;
  };
}

export interface CategoriesApiResponse {
  data: ApiCategory[] | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta?: {
    count: number;
  };
}

/**
 * Fetch active categories directly from the database with in-memory caching.
 * Direct database access avoids Vercel serverless self-fetch network loops,
 * deployment protection/401 errors, and cold start latency.
 */
export async function getCategories(): Promise<ApiCategory[]> {
  try {
    return await getCached(
      CACHE_KEYS.categories(),
      CACHE_TTL.ONE_HOUR,
      async () => {
        const rawCategories = await prisma.category.findMany({
          where: { is_active: true },
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { workerCategories: true },
            },
          },
        });

        return rawCategories.map((c) => ({
          id: c.id,
          name: c.name,
          name_bn: c.name_bn,
          slug: c.slug,
          icon: c.icon,
          description: c.description,
          is_active: c.is_active,
          created_at: c.created_at ? c.created_at.toISOString() : undefined,
          updated_at: c.updated_at ? c.updated_at.toISOString() : undefined,
          _count: {
            workers: c._count.workerCategories,
          },
        }));
      }
    );
  } catch (error) {
    console.error("Failed to fetch categories from database:", error);
    return [];
  }
}
