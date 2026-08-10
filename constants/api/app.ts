export const APP_API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
  },
  WORKERS: {
    BASE: "/api/v1/workers",
    BY_SLUG: (slug: string) => `/api/v1/workers/${slug}`,
    REVIEWS: (slug: string) => `/api/v1/workers/${slug}/reviews`,
  },
  ADMIN: {
    WORKERS: "/api/v1/workers",
    UPDATE_WORKER: (slug: string) => `/api/v1/workers/${slug}`,
  },
  CATEGORIES: {
    BASE: "/api/v1/categories",
  },
  LOCATIONS: {
    BASE: "/api/v1/locations",
  },
} as const;

export type TAppApi = typeof APP_API;
