#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditDataRetentionDocs, formatReport, parseArgs } from '../src/index.js';

function main(argv) {
  let options;
  try { options = parseArgs(argv); } catch (error) { console.error(error.message); return 2; }
  if (options.help) {
    console.log(`api-data-retention-doctor

Usage:
  api-data-retention-doctor <README.md|docs.md> [--min-score 80] [--json] [--expect-fail]

Checks API data retention/privacy docs for buyer-ready detail:
  - retention periods, data categories, deletion, backups, exports
  - GDPR/CCPA/DSAR, legal holds, anonymization, timelines
  - tenant scope, status tracking, examples, auditability

Examples:
  api-data-retention-doctor docs/privacy.md
  api-data-retention-doctor README.md --min-score 90 --json`);
    return 0;
  }
  if (!options.file) { console.error('Missing file. Run: api-data-retention-doctor <README.md|docs.md>'); return 2; }
  let text;
  try { text = readFileSync(resolve(options.file), 'utf8'); } catch (error) { console.error(`Cannot read ${options.file}: ${error.message}`); return 2; }
  const report = auditDataRetentionDocs(text, options);
  console.log(options.json ? JSON.stringify(report, null, 2) : formatReport(report));
  const passed = report.score >= options.minScore;
  if (options.expectFail) return passed ? 1 : 0;
  return passed ? 0 : 1;
}
process.exitCode = main(process.argv.slice(2));
