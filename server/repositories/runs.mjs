export function createRunRepository(db) {
  const insert = db.prepare(
    'INSERT INTO runs(id, token_hash, created_at) VALUES (?, ?, ?)',
  );
  const credentials = db.prepare('SELECT token_hash FROM runs WHERE id = ?');

  return {
    insert({ id, tokenHash, createdAt }) {
      insert.run(id, tokenHash, createdAt);
    },
    findCredentials(id) {
      return credentials.get(id);
    },
  };
}
