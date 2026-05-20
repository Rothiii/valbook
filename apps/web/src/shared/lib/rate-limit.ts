import { Ratelimit } from '@upstash/ratelimit';

import { redis } from './redis';

// Rate limit configs per api-design.md section 8.
// Identifier shape varies per call site (IP, user.id, workspace.id).
export const rateLimits = {
  signUp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'rl:signup',
  }),
  signIn: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    prefix: 'rl:signin',
  }),
  shareCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:share-create',
  }),
  inviteMember: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'rl:invite',
  }),
  attachmentUpload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'rl:attachment',
  }),
  valuationBulkImport: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'rl:val-import',
  }),
  publicShareView: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'rl:public',
  }),
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '15 m'),
    prefix: 'rl:default',
  }),
};

export type RateLimitName = keyof typeof rateLimits;
