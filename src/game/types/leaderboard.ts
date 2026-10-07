export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  level: number;
  completed: boolean;
  submittedAt: string;
}

export interface RunRegistration {
  id: string;
  token: string;
}

export interface RunResult {
  score: number;
  level: number;
  completed: boolean;
}
