import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const bin = new URL('../bin/api-data-retention-doctor.js', import.meta.url).pathname;

test('cli passes good example', () => {
  const r = spawnSync(process.execPath, [bin, 'examples/good.md', '--min-score', '90'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout, /score: 100\/100/);
});

test('cli fails weak example', () => {
  const r = spawnSync(process.execPath, [bin, 'examples/bad.md', '--min-score', '80'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Recommendations/);
});

test('cli json works', () => {
  const r = spawnSync(process.execPath, [bin, 'examples/good.md', '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).score, 100);
});
