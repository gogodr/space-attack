import { RequestError } from './errors.mjs';

export function validateSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestError(400, 'A score submission is required.');
  }
  const { runId, token, score, level, completed } = body;
  if (
    typeof runId !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(runId) ||
    typeof token !== 'string' ||
    !/^[A-Za-z0-9_-]{43}$/.test(token)
  ) {
    throw new RequestError(400, 'Valid run credentials are required.');
  }
  const nickname =
    typeof body.nickname === 'string' ? body.nickname.trim() : '';
  const nameLength = [...nickname].length;
  if (
    nameLength < 2 ||
    nameLength > 20 ||
    /[\u0000-\u001f\u007f-\u009f]/u.test(body.nickname)
  ) {
    throw new RequestError(
      400,
      'Nickname must contain 2–20 characters without control characters.',
    );
  }
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score % 50 !== 0 ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > 15 ||
    typeof completed !== 'boolean' ||
    (completed && level !== 15)
  ) {
    throw new RequestError(400, 'Invalid score, level, or completion result.');
  }
  return { runId, token, nickname, score, level, completed };
}
