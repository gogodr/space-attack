function normalize(row) {
  return row ? { ...row, score: Number(row.score) } : row;
}

export function createPostgresLeaderboardRepository(database) {
  return {
    async listTop() {
      return (
        await database.query(`SELECT id, nickname, score, level, completed, submitted_at
        FROM sa_entries ORDER BY score DESC, level DESC, completed DESC, submitted_at ASC, id ASC
        LIMIT 10`)
      ).map(normalize);
    },
    async insertOrFind(runId, entry) {
      // The unique run ID arbitrates concurrent requests across all function instances.
      const [inserted] = await database.query(
        `INSERT INTO sa_entries
        (id, run_id, nickname, score, level, completed, submitted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (run_id) DO NOTHING RETURNING id`,
        [
          entry.id,
          runId,
          entry.nickname,
          entry.score,
          entry.level,
          Number(entry.completed),
          entry.submittedAt,
        ],
      );
      if (inserted) return { entry, created: true };
      // A new statement sees the winning transaction even after a simultaneous insert.
      const [existing] = await database.query(
        'SELECT * FROM sa_entries WHERE run_id = $1',
        [runId],
      );
      if (!existing)
        throw new Error('Submitted leaderboard entry was unavailable.');
      return { existing: normalize(existing) };
    },
  };
}
