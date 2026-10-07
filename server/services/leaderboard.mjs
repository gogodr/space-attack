import { randomUUID } from 'node:crypto';
import { RequestError } from './errors.mjs';
import { matchesToken } from './credentials.mjs';
import { validateSubmission } from './submissionValidation.mjs';

function publicEntry(row) {
  return {
    id: row.id,
    nickname: row.nickname,
    score: row.score,
    level: row.level,
    completed: Boolean(row.completed),
    submittedAt: row.submitted_at,
  };
}

function matchesSubmission(entry, submission) {
  return (
    entry.nickname === submission.nickname &&
    entry.score === submission.score &&
    entry.level === submission.level &&
    Boolean(entry.completed) === submission.completed
  );
}

export function createLeaderboardService({ runs, leaderboard }) {
  return {
    async list() {
      return (await leaderboard.listTop()).map(publicEntry);
    },
    async submit(body) {
      const submission = validateSubmission(body);
      const { runId, token, nickname, score, level, completed } = submission;
      if (!matchesToken(await runs.findCredentials(runId), token)) {
        throw new RequestError(403, 'Run credentials are invalid.');
      }
      const entry = {
        id: randomUUID(),
        nickname,
        score,
        level,
        completed,
        submittedAt: new Date().toISOString(),
      };
      const result = await leaderboard.insertOrFind(runId, entry);
      if (result.existing) {
        if (!matchesSubmission(result.existing, submission)) {
          throw new RequestError(
            409,
            'This run already has a different submitted result.',
          );
        }
        return { entry: publicEntry(result.existing), created: false };
      }
      return result;
    },
  };
}
