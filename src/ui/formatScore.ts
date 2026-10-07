export const formatScore = (score: number) =>
  score.toLocaleString('en-US').padStart(6, '0');
