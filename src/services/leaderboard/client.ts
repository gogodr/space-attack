import type {
  RunRegistration,
  RunResult,
  LeaderboardResponse,
  SubmissionResponse,
} from './types';
import { request } from './http';

export const registerRun = (signal: AbortSignal) =>
  request<RunRegistration>('/api/runs', signal, {});
export const getLeaderboard = (signal: AbortSignal) =>
  request<LeaderboardResponse>('/api/leaderboard', signal);
export const submitScore = (
  registration: RunRegistration,
  result: RunResult,
  nickname: string,
  signal: AbortSignal,
) =>
  request<SubmissionResponse>('/api/leaderboard', signal, {
    runId: registration.id,
    token: registration.token,
    nickname,
    ...result,
  });
