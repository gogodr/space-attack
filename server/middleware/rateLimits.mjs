import { rateLimit } from 'express-rate-limit';

function limiter(limit, store) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ...(store ? { store } : {}),
    handler: (_req, res) =>
      res.status(429).json({
        error: 'Too many requests. Try again shortly.',
      }),
  });
}

export function createRateLimits(enabled, stores = {}) {
  return {
    register: enabled ? [limiter(20, stores.register)] : [],
    submit: enabled ? [limiter(30, stores.submit)] : [],
    read: enabled ? [limiter(120, stores.read)] : [],
  };
}
