type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  createdAt: number;
};

const memoryCache = new Map<string, CacheEntry<any>>();
const promiseCache = new Map<string, Promise<any>>();
const knownKeys = new Set<string>();

export const CACHE_TTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
} as const;

export const CACHE_KEYS = {
  categories: () => "categories:all",
  locations: () => "locations:all",
  workersList: (category?: string, city?: string, status?: string) =>
    `workers:cat:${category ?? "all"}:city:${city ?? "all"}:status:${status ?? "all"}`,
  workerBySlug: (slug: string) => `worker:slug:${slug}`,
} as const;

export type CacheKeyType = typeof CACHE_KEYS;

export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  knownKeys.add(key);

  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  let promise = promiseCache.get(key);
  if (promise) {
    return promise as Promise<T>;
  }

  promise = (async () => {
    try {
      const value = await fetcher();
      memoryCache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
        createdAt: Date.now(),
      });
      return value;
    } finally {
      promiseCache.delete(key);
    }
  })();

  promiseCache.set(key, promise);
  return promise;
}

export function deleteCache(key: string): boolean {
  return memoryCache.delete(key);
}

export function clearCache(): void {
  memoryCache.clear();
  promiseCache.clear();
}

export function getCacheStats() {
  const now = Date.now();
  const activeEntries = Array.from(memoryCache.entries()).map(([key, entry]) => ({
    key,
    value: entry.value,
    createdAt: new Date(entry.createdAt).toISOString(),
    expiresAt: new Date(entry.expiresAt).toISOString(),
    timeToLiveMs: Math.max(0, entry.expiresAt - now),
    isExpired: entry.expiresAt <= now,
  }));

  return {
    activeKeysCount: memoryCache.size,
    pendingFetchesCount: promiseCache.size,
    knownKeys: Array.from(knownKeys),
    activeEntries,
  };
}
