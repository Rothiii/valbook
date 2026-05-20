import { Ratelimit } from '@upstash/ratelimit';

import { isUpstashConfigured, redis } from './redis';

type Window = { limit: number; intervalMs: number };

const configs = {
  signUp: { limit: 5, intervalMs: 60 * 60 * 1000 },
  signIn: { limit: 10, intervalMs: 15 * 60 * 1000 },
  shareCreate: { limit: 10, intervalMs: 60 * 60 * 1000 },
  inviteMember: { limit: 50, intervalMs: 60 * 60 * 1000 },
  attachmentUpload: { limit: 100, intervalMs: 60 * 60 * 1000 },
  valuationBulkImport: { limit: 5, intervalMs: 60 * 60 * 1000 },
  publicShareView: { limit: 100, intervalMs: 60 * 1000 },
  default: { limit: 1000, intervalMs: 15 * 60 * 1000 },
} as const satisfies Record<string, Window>;

export type RateLimitName = keyof typeof configs;

type LimitResult = { success: boolean; limit: number; remaining: number; reset: number };

const memoryHits = new Map<string, number[]>();

function memoryLimit(name: RateLimitName, identifier: string): LimitResult {
  const cfg = configs[name];
  const cutoff = Date.now() - cfg.intervalMs;
  const key = `${name}:${identifier}`;
  const hits = (memoryHits.get(key) ?? []).filter((t) => t > cutoff);
  hits.push(Date.now());
  memoryHits.set(key, hits);
  const remaining = Math.max(0, cfg.limit - hits.length);
  return {
    success: hits.length <= cfg.limit,
    limit: cfg.limit,
    remaining,
    reset: cutoff + cfg.intervalMs,
  };
}

const upstashLimits: Partial<Record<RateLimitName, Ratelimit>> = {};

function getUpstashLimit(name: RateLimitName): Ratelimit {
  const cached = upstashLimits[name];
  if (cached) return cached;
  if (!redis) {
    throw new Error('Upstash Redis not configured');
  }
  const cfg = configs[name];
  const seconds = Math.floor(cfg.intervalMs / 1000);
  const limit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.limit, `${seconds} s`),
    prefix: `rl:${name}`,
  });
  upstashLimits[name] = limit;
  return limit;
}

export async function checkRateLimit(
  name: RateLimitName,
  identifier: string,
): Promise<LimitResult> {
  if (!isUpstashConfigured) {
    return memoryLimit(name, identifier);
  }
  const limiter = getUpstashLimit(name);
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
