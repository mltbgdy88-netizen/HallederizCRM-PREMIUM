const { spawn, spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
for (const app of ['api', 'worker']) {
  const result = spawnSync(process.execPath, ['scripts/ci/prepare-node-runtime.cjs', app], { cwd: root, stdio: 'inherit' });
  assert.equal(result.status, 0);
}
const env = { ...process.env, NODE_ENV: 'production', PERSISTENCE_MODE: 'postgres', WORKER_MODE: 'disabled',
  DEMO_AUTH_ENABLED: 'false', LOCAL_PILOT_AUTH_ENABLED: 'false', NEXT_PUBLIC_ENABLE_DEMO_AUTH: 'false', NEXT_PUBLIC_USE_DEMO_DATA: 'false', ALLOW_DEMO_FALLBACK: 'false',
  AUTH_SESSION_SECRET: randomBytes(32).toString('hex'), TENANT_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
  DATABASE_URL: 'postgresql://127.0.0.1:1/unavailable', POSTGRES_URL: '', REDIS_URL: 'redis://127.0.0.1:1', HOST_API: '127.0.0.1', PORT_API: '14010' };
delete env.POSTGRES_URL;
const worker = spawnSync(process.execPath, ['apps/worker/dist/index.js'], { cwd: root, env, encoding: 'utf8', timeout: 15000 });
assert.equal(worker.status, 0, worker.stderr);
const api = spawn(process.execPath, ['apps/api/dist/index.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
let output = ''; api.stdout.on('data', chunk => { output += chunk; }); api.stderr.on('data', chunk => { output += chunk; });
(async () => {
  try {
    let healthy = false;
    for (let i = 0; i < 100; i++) {
      if (api.exitCode !== null) throw new Error(`API exited: ${output}`);
      try { healthy = (await fetch('http://127.0.0.1:14010/health')).status === 200; } catch {}
      if (healthy) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(healthy, output);
    assert.equal((await fetch('http://127.0.0.1:14010/ready')).status, 503, 'Unavailable Redis must block readiness');
    console.log('PASS: plain Node API boot, worker entrypoint, production readiness fail-closed');
  } finally { api.kill('SIGTERM'); }
})().catch(error => { console.error(error); process.exitCode = 1; });
