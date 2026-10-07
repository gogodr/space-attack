import type { RunRegistration } from '../../services/leaderboard';
import type { ScoreSubmission } from './useScoreSubmission';

export function ScoreForm({
  submission,
  registration,
  registrationStatus,
}: {
  submission: ScoreSubmission;
  registration: RunRegistration | null;
  registrationStatus: string;
}) {
  const {
    nickname,
    setNickname,
    submitState,
    submitError,
    submittedNickname,
    submit,
  } = submission;
  return (
    <>
      {submitState === 'sent' ? (
        <p className="submission-success" role="status">
          Score submitted. See you among the stars, {submittedNickname}.
        </p>
      ) : registration ? (
        <form onSubmit={submit} className="score-form">
          <label htmlFor="nickname">
            Submit your score <span>optional · no account needed</span>
          </label>
          <div className="form-row">
            <input
              id="nickname"
              autoComplete="nickname"
              placeholder="Your pilot nickname"
              minLength={2}
              maxLength={20}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              disabled={submitState === 'sending' || submittedNickname !== null}
              required
              aria-describedby="submission-note"
            />
            <button type="submit" disabled={submitState === 'sending'}>
              {submitState === 'sending'
                ? 'Sending…'
                : submittedNickname
                  ? 'Retry score'
                  : 'Submit'}
            </button>
          </div>
          <p
            id="submission-note"
            className={submitError ? 'form-error' : 'fine-print'}
            role={submitError ? 'alert' : undefined}
          >
            {submitError || 'Your nickname and result will be public.'}
          </p>
        </form>
      ) : (
        <p className="fine-print" role="status">
          {registrationStatus === 'pending'
            ? 'Your run is connecting. Submission will be available shortly.'
            : 'This run could not connect to the leaderboard. You can still browse scores and play again.'}
        </p>
      )}
    </>
  );
}
