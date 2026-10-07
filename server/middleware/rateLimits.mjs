import { rateLimit } from 'express-rate-limit';

function limiter(limit) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        error: 'Too many requests. Try again shortly.',
      }),
  });
}

export function createRateLimits(enabled) {
  return {
    register: enabled ? [limiter(20)] : [],
    submit: enabled ? [limiter(30)] : [],
    read: enabled ? [limiter(120)] : [],
  };
}
