import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { openPostgres } from './database/postgres.mjs';
import { migratePostgres } from './database/postgresSchema.mjs';
import { createPostgresStorage } from './database/storage.mjs';
import { createApp } from './app.mjs';

test('live Postgres: concurrent APIs share credentials, scores and rate limits', async (t) => {
  const database = openPostgres(process.env.DATABASE_URL);
  const schema = `sa_test_${randomUUID().replaceAll('-', '')}`;
  await database.query(`CREATE SCHEMA ${schema}`);
  t.after(async () => {
    await database.query(`DROP SCHEMA ${schema} CASCADE`);
  });
  // Isolate every test table from the real leaderboard. Generated schema name only.
  const scoped = {
    query: (sql, parameters) =>
      database.query(
        sql.replace(/\bsa_(runs|entries|rate_limits)\b/g, `${schema}.sa_$1`),
        parameters,
      ),
  };
  await migratePostgres(scoped);
  await migratePostgres(scoped); // Additive migrations must be safe to repeat.
  const apps = [0, 1].map(() =>
    createApp({ storage: createPostgresStorage(scoped) }),
  );
  const servers = apps.map(({ app }) => app.listen(0, '127.0.0.1'));
  await Promise.all(servers.map((server) => once(server, 'listening')));
  t.after(async () => {
    await Promise.all(
      servers.map((server) => new Promise((resolve) => server.close(resolve))),
    );
  });
  async function request(instance, path, body) {
    const response = await fetch(
      `http://127.0.0.1:${servers[instance].address().port}${path}`,
      body === undefined
        ? {}
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
    );
    return { status: response.status, data: await response.json() };
  }
  assert.equal((await request(0, '/api/health')).status, 200);
  assert.deepEqual((await request(1, '/api/leaderboard')).data, {
    entries: [],
  });
  const registered = await request(0, '/api/runs', {});
  assert.equal(registered.status, 201);
  const submission = {
    runId: registered.data.id,
    token: registered.data.token,
    nickname: '  NeonPilot  ',
    score: 500,
    level: 3,
    completed: false,
  };
  assert.equal(
    (await request(1, '/api/leaderboard', { ...submission, score: 51 })).status,
    400,
  );
  assert.equal(
    (await request(1, '/api/leaderboard', { ...submission, token: 'x'.repeat(43) }))
      .status,
    403,
  );
  const identical = await Promise.all(
    [0, 1].map((instance) => request(instance, '/api/leaderboard', submission)),
  );
  assert.deepEqual(identical.map((result) => result.status).sort(), [200, 201]);
  assert.equal(identical[0].data.entry.id, identical[1].data.entry.id);
  assert.equal(identical[0].data.entry.nickname, 'NeonPilot');
  assert.equal(
    (await request(1, '/api/leaderboard', { ...submission, score: 550 }))
      .status,
    409,
  );
  const listed = (await request(1, '/api/leaderboard')).data.entries;
  assert.equal(listed.length, 1);
  assert.equal(listed[0].score, 500);
  assert.ok(!('run_id' in listed[0]));
  assert.ok(!('token_hash' in listed[0]));
  // Two independently constructed stores must increment one shared database counter.
  const first = createPostgresStorage(scoped).rateLimitStores.read;
  const second = createPostgresStorage(scoped).rateLimitStores.read;
  first.init({ windowMs: 60_000 });
  second.init({ windowMs: 60_000 });
  const counts = await Promise.all([
    first.increment('fixture-client'),
    second.increment('fixture-client'),
  ]);
  assert.deepEqual(counts.map((result) => result.totalHits).sort(), [1, 2]);
  await scoped.query(
    'UPDATE sa_rate_limits SET reset_at = 0 WHERE bucket = $1 AND key_hash = $2',
    ['read', first.hash('fixture-client')],
  );
  assert.equal((await second.increment('fixture-client')).totalHits, 1);
  await first.resetKey('fixture-client');
  assert.equal((await second.increment('fixture-client')).totalHits, 1);
  // Actual middleware quotas also apply across different application instances.
  for (let i = 0; i < 19; i++)
    assert.equal((await request(i % 2, '/api/runs', {})).status, 201);
  assert.equal((await request(1, '/api/runs', {})).status, 429);
});
