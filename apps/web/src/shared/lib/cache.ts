import 'server-only';

import { redis } from './redis';

const DEFAULT_TTL_SECONDS = 60;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS) {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheInvalidate(key: string) {
  await redis.del(key);
}

export async function cacheInvalidateByPattern(pattern: string) {
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
