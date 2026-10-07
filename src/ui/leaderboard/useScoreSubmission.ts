import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LeaderboardError, submitScore } from '../../services/leaderboard';
import type { RunRegistration, RunResult } from '../../services/leaderboard';

/** Keep the first sent nickname stable across ambiguous failures for idempotent retry. */
export function useScoreSubmission(
  result: RunResult,
  registration: RunRegistration | null,
  onSubmitted: () => void,
) {
  const [nickname, setNickname] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState('');
  const submitController = useRef<AbortController | null>(null);
  const submittedNickname = useRef<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      submitController.current?.abort();
    };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!registration || submitState !== 'idle') return;
    const label = submittedNickname.current ?? nickname.trim();
    if (
      [...label].length < 2 ||
      [...label].length > 20 ||
      /[\u0000-\u001f\u007f-\u009f]/.test(label)
    ) {
      setSubmitError(
        'Use a nickname with 2–20 characters and no control characters.',
      );
      return;
    }
    // Retain the exact payload for safe retries after ambiguous network failure.
    submittedNickname.current = label;
    setSubmitState('sending');
    setSubmitError('');
    const controller = new AbortController();
    submitController.current = controller;
    try {
      await submitScore(registration, result, label, controller.signal);
      if (mounted.current && !controller.signal.aborted) {
        setSubmitState('sent');
        onSubmitted();
      }
    } catch (error) {
      if (mounted.current && !controller.signal.aborted) {
        if (
          error instanceof LeaderboardError &&
          [400, 413].includes(error.status)
        )
          submittedNickname.current = null;
        setSubmitState('idle');
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Submission failed. Please retry.',
        );
      }
    }
  }
  return {
    nickname,
    setNickname,
    submitState,
    submitError,
    submittedNickname: submittedNickname.current,
    submit,
  };
}
export type ScoreSubmission = ReturnType<typeof useScoreSubmission>;
