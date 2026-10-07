import type { RunResult, RunRegistration } from '../../services/leaderboard';
import { useLeaderboard } from './useLeaderboard';
import { useScoreSubmission } from './useScoreSubmission';
import { LeaderboardList } from './LeaderboardList';
import { ScoreForm } from './ScoreForm';

export function Leaderboard({
  result,
  registration,
  registrationStatus,
}: {
  result: RunResult;
  registration: RunRegistration | null;
  registrationStatus: string;
}) {
  const rankings = useLeaderboard();
  const submission = useScoreSubmission(result, registration, rankings.refresh);
  return (
    <section className="leaderboard" aria-label="Shared online leaderboard">
      <div className="section-heading">
        <h3>World leaderboard</h3>
        <span>TOP 10</span>
      </div>
      <LeaderboardList {...rankings} />
      <ScoreForm
        submission={submission}
        registration={registration}
        registrationStatus={registrationStatus}
      />
    </section>
  );
}
