export type {
  LeaderboardEntry,
  RunRegistration,
  RunResult,
} from '../../game/types';
import type { LeaderboardEntry } from '../../game/types';

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}
export interface SubmissionResponse {
  entry: LeaderboardEntry;
}
