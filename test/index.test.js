import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditDataRetentionDocs, formatReport, parseArgs } from '../src/index.js';

const good = readFileSync(new URL('../examples/good.md', import.meta.url), 'utf8');
const bad = readFileSync(new URL('../examples/bad.md', import.meta.url), 'utf8');

test('good data retention docs score highly', () => {
  const report = auditDataRetentionDocs(good, { minScore: 90 });
  assert.equal(report.passed, true);
  assert.equal(report.score, 100);
});

test('bad docs fail with recommendations', () => {
  const report = auditDataRetentionDocs(bad, { minScore: 80 });
  assert.equal(report.passed, false);
  assert.ok(report.score < 30);
  assert.ok(report.recommendations.some(r => r.includes('exact retention periods')));
});

test('warnings catch data retention rough edges', () => {
  const report = auditDataRetentionDocs('GDPR export and deletion request with retention policy.', { minScore: 1 });
  assert.ok(report.warnings.length >= 2);
});

test('formats readable report', () => {
  assert.match(formatReport(auditDataRetentionDocs(bad)), /api-data-retention-doctor score/);
});

test('parses args', () => {
  assert.deepEqual(parseArgs(['docs.md', '--min-score', '90', '--json']), { file: 'docs.md', minScore: 90, json: true, help: false, expectFail: false });
});
