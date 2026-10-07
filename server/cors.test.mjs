import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './app.mjs';

test('Sites origin can preflight and register; other origins receive no CORS grant', async t => {
  const allowed = 'https://game.example';
  const instance = createApp({databasePath:':memory:',databaseUrl:'',rateLimits:false,corsOrigins:[allowed]});
  const server = instance.app.listen(0, '127.0.0.1');
  await once(server,'listening');
  t.after(async()=>{await new Promise(resolve=>server.close(resolve)); instance.close();});
  const endpoint = `http://127.0.0.1:${server.address().port}/api/runs`;
  const preflight = await fetch(endpoint, {method:'OPTIONS',headers:{Origin:allowed,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),allowed);
  assert.equal(preflight.headers.get('access-control-allow-credentials'),null);
  const registered = await fetch(endpoint,{method:'POST',headers:{Origin:allowed,'Content-Type':'application/json'},body:'{}'});
  assert.equal(registered.status,201);
  assert.equal(registered.headers.get('access-control-allow-origin'),allowed);
  const rejected = await fetch(endpoint,{method:'OPTIONS',headers:{Origin:'https://other.example','Access-Control-Request-Method':'POST'}});
  assert.equal(rejected.headers.get('access-control-allow-origin'),null);
  const health = await fetch(endpoint.replace('/runs','/health'));
  assert.equal(health.status,200);
});
