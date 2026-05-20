import { isUpstashConfigured, redis } from './redis';

const DEFAULT_TTL_SECONDS = 60;

type CacheEntry = { value: unknown; expiresAt: number };
const memoryStore = new Map<string, CacheEntry>();

function memoryGet<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value as T;
}

function memorySet<T>(key: string, value: T, ttlSeconds: number) {
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isUpstashConfigured || !redis) {
    return memoryGet<T>(key);
  }
  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS) {
  if (!isUpstashConfigured || !redis) {
    memorySet(key, value, ttlSeconds);
    return;
  }
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheInvalidate(key: string) {
  if (!isUpstashConfigured || !redis) {
    memoryStore.delete(key);
    return;
  }
  await redis.del(key);
}

export async function cacheInvalidateByPattern(pattern: string) {
  if (!isUpstashConfigured || !redis) {
    const regex = patternToRegex(pattern);
    for (const key of memoryStore.keys()) {
      if (regex.test(key)) memoryStore.delete(key);
    }
    return;
  }
  let cursor = 0;
  do {
    const [next, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = Number(next);
  } while (cursor !== 0);
}

export async function cacheOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replaceAll(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`);
}
