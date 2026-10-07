import { RequestError } from '../services/errors.mjs';

export function apiNotFound(_req, res) {
  res.status(404).json({ error: 'API route not found.' });
}

export function resourceNotFound(_req, res) {
  res
    .status(404)
    .json({
      error: 'Resource not found. Build the website before production start.',
    });
}

export function handleErrors(error, _req, res, _next) {
  if (error instanceof RequestError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  console.error('Leaderboard request failed:', error.code || error.name);
  return res.status(500).json({ error: 'Leaderboard unavailable. Try again.' });
}
