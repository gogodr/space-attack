import { LeaderboardError } from './errors';

/** Relay caller cancellation and enforce a 12-second service timeout. */
export async function request<T>(
  path: string,
  signal: AbortSignal,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) controller.abort();
  const timeout = setTimeout(abort, 12000);
  try {
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
    const response = await fetch(`${base}${path}`, {
      signal: controller.signal,
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        'The leaderboard service is unavailable. Please try again.',
      );
    }
    if (!response.ok) {
      const message = (data as { error?: string }).error;
      throw new LeaderboardError(
        message || 'The leaderboard service is unavailable. Please try again.',
        response.status,
      );
    }
    return data as T;
  } catch (error) {
    if (controller.signal.aborted && !signal.aborted)
      throw new Error('The leaderboard connection timed out. Please retry.');
    if (error instanceof TypeError)
      throw new Error(
        'Could not connect to the leaderboard. Please try again.',
      );
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}
