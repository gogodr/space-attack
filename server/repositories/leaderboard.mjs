export function createLeaderboardRepository(db) {
  const topEntries = db.prepare(`
    SELECT id, nickname, score, level, completed, submitted_at
    FROM entries
    ORDER BY score DESC, level DESC, completed DESC, submitted_at ASC, id ASC
    LIMIT 10
  `);
  const findByRun = db.prepare('SELECT * FROM entries WHERE run_id = ?');
  const insert = db.prepare(`
    INSERT INTO entries(id, run_id, nickname, score, level, completed, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  return {
    listTop() {
      return topEntries.all();
    },
    findByRun(runId) {
      return findByRun.get(runId);
    },
    insert(runId, entry) {
      insert.run(
        entry.id,
        runId,
        entry.nickname,
        entry.score,
        entry.level,
        Number(entry.completed),
        entry.submittedAt,
      );
    },
    insertOrFind(runId, entry) {
      return this.transaction(() => {
        const existing = this.findByRun(runId);
        if (existing) return { existing };
        this.insert(runId, entry);
        return { entry, created: true };
      });
    },
    // Serialize the check and insert before the UNIQUE run_id constraint is tested.
    transaction(operation) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = operation();
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
