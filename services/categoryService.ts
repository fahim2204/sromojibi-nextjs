import { APP_API } from "@/constants/api";

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

export const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
};

/**
 * Fetch active categories from the database via the API endpoint (/api/v1/categories)
 */
export async function getCategories(): Promise<ApiCategory[]> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${APP_API.CATEGORIES.BASE}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const json: CategoriesApiResponse = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch categories via API:", error);
    return [];
  }
}
