import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from './app.mjs';

async function fixture(t, options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'space-attack-'));
  const databasePath = join(dir, 'scores.sqlite');
  const distPath = join(dir, 'dist');
  if (options.spa) {
    mkdirSync(distPath);
    writeFileSync(
      join(distPath, 'index.html'),
      '<html>Space Attack test</html>',
    );
  }
  let instance;
  let server;
  let base;
  async function start() {
    instance = createApp({
      databasePath,
      distPath,
      rateLimits: false,
      ...options,
    });
    server = instance.app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
  }
  async function stop() {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    instance.close();
  }
  await start();
  t.after(async () => {
    await stop();
    rmSync(dir, { recursive: true, force: true });
  });
  async function request(path, body, raw = false) {
    const response = await fetch(
      base + path,
      body === undefined
        ? {}
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: raw ? body : JSON.stringify(body),
          },
    );
    const text = await response.text();
    return {
      status: response.status,
      data: response.headers.get('content-type')?.includes('json')
        ? JSON.parse(text)
        : text,
    };
  }
  return {
    request,
    databasePath,
    async restart() {
      await stop();
      await start();
    },
  };
}
async function submission(request, fields = {}) {
  const registered = await request('/api/runs', {});
  assert.equal(registered.status, 201);
  return {
    runId: registered.data.id,
    token: registered.data.token,
    nickname: 'Pilot',
    score: 500,
    level: 3,
    completed: false,
    ...fields,
  };
}

test('registration, cross-client reads and optional submissions expose only public fields', async (t) => {
  const { request, databasePath } = await fixture(t);
  assert.deepEqual((await request('/api/leaderboard')).data, { entries: [] });
  const body = await submission(request, { nickname: '  星际Pilot  ' });
  const posted = await request('/api/leaderboard', body);
  assert.equal(posted.status, 201);
  assert.equal(posted.data.entry.nickname, '星际Pilot');
  assert.ok(!Number.isNaN(Date.parse(posted.data.entry.submittedAt)));
  const publicRead = (await request('/api/leaderboard')).data;
  assert.deepEqual(publicRead.entries, [posted.data.entry]);
  assert.deepEqual(Object.keys(publicRead.entries[0]).sort(), [
    'completed',
    'id',
    'level',
    'nickname',
    'score',
    'submittedAt',
  ]);
  assert.ok(!JSON.stringify(publicRead).includes(body.token));
  const db = new DatabaseSync(databasePath);
  const row = db.prepare('SELECT * FROM runs WHERE id = ?').get(body.runId);
  assert.equal(Buffer.from(row.token_hash).length, 32);
  assert.ok(!JSON.stringify(row).includes(body.token));
  db.close();
});

test('concurrent identical retries persist one entry, conflicts never overwrite it', async (t) => {
  const { request } = await fixture(t);
  const body = await submission(request);
  const replies = await Promise.all(
    Array.from({ length: 12 }, () => request('/api/leaderboard', body)),
  );
  assert.equal(replies.filter((r) => r.status === 201).length, 1);
  assert.equal(replies.filter((r) => r.status === 200).length, 11);
  assert.equal(new Set(replies.map((r) => r.data.entry.id)).size, 1);
  for (const change of [
    { score: 550 },
    { nickname: 'Other' },
    { level: 4 },
    { completed: true, level: 15 },
  ])
    assert.equal(
      (await request('/api/leaderboard', { ...body, ...change })).status,
      409,
    );
  assert.equal((await request('/api/leaderboard')).data.entries.length, 1);
  assert.equal((await request('/api/leaderboard', body)).data.entry.score, 500);
});

test('server validates every public submission field and rejects bad credentials', async (t) => {
  const { request } = await fixture(t);
  const body = await submission(request);
  const invalid = [
    { nickname: '' },
    { nickname: 'a' },
    { nickname: 'a'.repeat(21) },
    { nickname: 'ab\n' },
    { nickname: 'ab\u0085' },
    { nickname: 12 },
    { score: -50 },
    { score: 51 },
    { score: 1.5 },
    { score: '500' },
    { score: Number.MAX_SAFE_INTEGER + 1 },
    { level: 0 },
    { level: 16 },
    { level: 2.5 },
    { completed: 'false' },
    { completed: true, level: 14 },
    { runId: 'unknown' },
    { token: '' },
  ];
  for (const change of invalid) {
    const result = await request('/api/leaderboard', { ...body, ...change });
    assert.equal(result.status, 400, JSON.stringify(change));
    assert.equal(typeof result.data.error, 'string');
  }
  assert.equal(
    (await request('/api/leaderboard', { ...body, token: 'a'.repeat(43) }))
      .status,
    403,
  );
  assert.equal(
    (
      await request('/api/leaderboard', {
        ...body,
        runId: '00000000-0000-0000-0000-000000000000',
      })
    ).status,
    403,
  );
  assert.equal((await request('/api/leaderboard', {})).status, 400);
  assert.equal((await request('/api/leaderboard', '{', true)).status, 400);
  assert.equal(
    (await request('/api/leaderboard', { filler: 'x'.repeat(5000) })).status,
    413,
  );
  assert.equal((await request('/api/leaderboard')).data.entries.length, 0);
  assert.equal(
    (
      await request('/api/leaderboard', {
        ...body,
        level: 15,
        completed: true,
        score: 0,
      })
    ).status,
    201,
  );
});

test('competing different submissions accept exactly one winner', async (t) => {
  const { request } = await fixture(t);
  const body = await submission(request);
  const competing = Array.from({ length: 10 }, (_, i) => ({
    ...body,
    score: i * 50,
  }));
  const results = await Promise.all(
    competing.map((entry) => request('/api/leaderboard', entry)),
  );
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 9);
  const winner = results.find((r) => r.status === 201).data.entry;
  assert.deepEqual((await request('/api/leaderboard')).data.entries, [winner]);
});

test('equal scores use earlier submission then stable entry ID, duplicate nicknames allowed', async (t) => {
  const { request, databasePath } = await fixture(t);
  const entries = [];
  for (let i = 0; i < 3; i++) {
    const body = await submission(request, { nickname: 'Same nickname' });
    const reply = await request('/api/leaderboard', body);
    assert.equal(reply.status, 201);
    entries.push(reply.data.entry);
  }
  const db = new DatabaseSync(databasePath);
  db.prepare('UPDATE entries SET submitted_at = ?').run(
    '2026-01-02T00:00:00.000Z',
  );
  db.prepare('UPDATE entries SET submitted_at = ? WHERE id = ?').run(
    '2026-01-01T00:00:00.000Z',
    entries[2].id,
  );
  db.close();
  const ranked = (await request('/api/leaderboard')).data.entries;
  assert.deepEqual(
    ranked.map((entry) => entry.id),
    [
      entries[2].id,
      ...entries
        .slice(0, 2)
        .map((entry) => entry.id)
        .sort(),
    ],
  );
});

test('leaderboard survives restart, ranks deterministically and limits top results to ten', async (t) => {
  const { request, restart } = await fixture(t);
  const bodies = [];
  for (let i = 0; i < 12; i++) {
    const body = await submission(request, {
      nickname: `Pilot ${i}`,
      score: i * 100,
      level: 1,
    });
    bodies.push(body);
    await request('/api/leaderboard', body);
  }
  const levelTie = await submission(request, {
    nickname: 'Level tie',
    score: 1100,
    level: 15,
  });
  const completeTie = await submission(request, {
    nickname: 'Winner tie',
    score: 1100,
    level: 15,
    completed: true,
  });
  await request('/api/leaderboard', levelTie);
  await request('/api/leaderboard', completeTie);
  const expected = (await request('/api/leaderboard')).data;
  assert.equal(expected.entries.length, 10);
  assert.deepEqual(
    expected.entries.slice(0, 3).map((e) => e.nickname),
    ['Winner tie', 'Level tie', 'Pilot 11'],
  );
  await restart();
  assert.deepEqual((await request('/api/leaderboard')).data, expected);
  assert.equal((await request('/api/leaderboard', bodies[0])).status, 200);
});

test('rate limits are enforced and malformed/unknown API calls never receive SPA HTML', async (t) => {
  const { request } = await fixture(t, { rateLimits: true, spa: true });
  for (let i = 0; i < 20; i++)
    assert.equal((await request('/api/runs', {})).status, 201);
  const limited = await request('/api/runs', {});
  assert.equal(limited.status, 429);
  assert.equal(typeof limited.data.error, 'string');
  assert.equal((await request('/api/not-found')).status, 404);
  assert.deepEqual((await request('/api/health')).data, { status: 'ok' });
  assert.equal((await request('/')).data, '<html>Space Attack test</html>');
  assert.equal((await request('/play')).data, '<html>Space Attack test</html>');
});
