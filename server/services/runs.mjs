import { randomUUID } from 'node:crypto';
import { hashToken, issueToken } from './credentials.mjs';

export function createRunService(runs) {
  return {
    register() {
      const id = randomUUID();
      const token = issueToken();
      runs.insert({
        id,
        tokenHash: hashToken(token),
        createdAt: new Date().toISOString(),
      });
      return { id, token };
    },
  };
}
