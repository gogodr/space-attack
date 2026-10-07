import { randomUUID } from 'node:crypto';
import { hashToken, issueToken } from './credentials.mjs';

export function createRunService(runs) {
  return {
    async register() {
      const id = randomUUID();
      const token = issueToken();
      await runs.insert({
        id,
        tokenHash: hashToken(token),
        createdAt: new Date().toISOString(),
      });
      return { id, token };
    },
  };
}
