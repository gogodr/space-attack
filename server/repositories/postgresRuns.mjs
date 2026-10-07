export function createPostgresRunRepository(database) {
  return {
    async insert({ id, tokenHash, createdAt }) {
      await database.query(
        'INSERT INTO sa_runs(id, token_hash, created_at) VALUES ($1, $2, $3)',
        [id, tokenHash.toString('hex'), createdAt],
      );
    },
    async findCredentials(id) {
      const [run] = await database.query(
        'SELECT token_hash FROM sa_runs WHERE id = $1',
        [id],
      );
      return run
        ? { token_hash: Buffer.from(run.token_hash, 'hex') }
        : undefined;
    },
  };
}
