import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function issueToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest();
}

export function matchesToken(run, token) {
  return (
    Boolean(run) &&
    timingSafeEqual(Buffer.from(run.token_hash), hashToken(token))
  );
}
