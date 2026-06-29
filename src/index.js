const CHECKS = [
  { id: 'retention-periods', points: 11, message: 'States retention periods for key data.', test: t => /(retention|retain|stored for|kept for)/i.test(t) && /(day|days|month|months|year|years|forever|indefinitely)/i.test(t) },
  { id: 'data-categories', points: 9, message: 'Defines data categories covered.', test: t => /(user data|customer data|metadata|logs|audit|backups|files|events|analytics|billing)/i.test(t) },
  { id: 'deletion-api', points: 9, message: 'Documents deletion endpoints or workflow.', test: t => /(DELETE\s+\/|delete endpoint|deletion request|erase|purge|right to deletion|right to erasure)/i.test(t) },
  { id: 'soft-hard-delete', points: 8, message: 'Explains soft delete vs hard delete.', test: t => /(soft delete|hard delete|tombstone|recover|restore|permanent deletion|purge)/i.test(t) },
  { id: 'backup-retention', points: 8, message: 'Covers backup/snapshot retention.', test: t => /(backup|snapshot|replica|archive)/i.test(t) && /(retention|purge|delete|days|restore)/i.test(t) },
  { id: 'export-portability', points: 8, message: 'Documents data export/portability.', test: t => /(export|download|portability|data copy|CSV|JSON|archive)/i.test(t) },
  { id: 'privacy-rights', points: 8, message: 'Mentions privacy rights and compliance.', test: t => /(GDPR|CCPA|privacy|data subject|DSAR|right to erasure|right to access|consent)/i.test(t) },
  { id: 'legal-hold', points: 6, message: 'Explains legal hold or exceptions.', test: t => /(legal hold|litigation|compliance hold|exception|cannot delete|required by law|fraud)/i.test(t) },
  { id: 'anonymization', points: 7, message: 'Covers anonymization or redaction.', test: t => /(anonymi[sz]e|pseudonymi[sz]e|redact|masked|aggregate|de-identif)/i.test(t) },
  { id: 'timelines-sla', points: 7, message: 'States deletion/export timelines.', test: t => /(within \d+|\d+ days|SLA|timeline|processing time|completed within)/i.test(t) },
  { id: 'tenant-scope', points: 5, message: 'Defines tenant/account scope.', test: t => /(tenant|workspace|organization|account|project|scope)/i.test(t) },
  { id: 'webhooks-status', points: 4, message: 'Mentions status tracking or notifications.', test: t => /(status|webhook|callback|notification|completed|processing|job)/i.test(t) },
  { id: 'examples', points: 8, message: 'Includes concrete API examples.', test: t => /(curl|```bash|```json|GET\s+\/|POST\s+\/|DELETE\s+\/)/i.test(t) && /(delete|export|retention|privacy)/i.test(t) },
  { id: 'auditability', points: 4, message: 'Mentions audit trails for retention actions.', test: t => /(audit|log|request_id|trace_id|actor|history)/i.test(t) }
];

export function parseArgs(argv) {
  const options = { file: '', minScore: 80, json: false, help: false, expectFail: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--expect-fail') options.expectFail = true;
    else if (arg === '--min-score') {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error('--min-score must be 0-100');
      options.minScore = n;
    } else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else if (!options.file) options.file = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  return options;
}

export function auditDataRetentionDocs(documentText, options = {}) {
  const text = String(documentText || '');
  const checks = CHECKS.map(c => ({ id: c.id, points: c.points, passed: c.test(text), message: c.message }));
  const earned = checks.filter(c => c.passed).reduce((s, c) => s + c.points, 0);
  const possible = checks.reduce((s, c) => s + c.points, 0);
  const score = Math.round((earned / possible) * 100);
  const minScore = options.minScore ?? 80;
  const warnings = buildWarnings(text);
  return { score, minScore, passed: score >= minScore, earned, possible, checks, warnings, recommendations: checks.filter(c => !c.passed).map(c => recommendationFor(c.id)) };
}
export const auditPermissionsMatrixDocs = auditDataRetentionDocs;

function buildWarnings(text) {
  const warnings = [];
  if (/(delete|deletion|erase)/i.test(text) && !/(backup|snapshot|archive)/i.test(text)) warnings.push('Deletion docs should explain what happens to backups and snapshots.');
  if (/(retain|retention)/i.test(text) && !/(days|months|years|indefinitely)/i.test(text)) warnings.push('Retention docs should include exact durations.');
  if (/(GDPR|CCPA|privacy|DSAR)/i.test(text) && !/(timeline|within \d+|SLA|days)/i.test(text)) warnings.push('Privacy request docs should include response timelines.');
  if (/(export|download)/i.test(text) && !/(delete|retention|expires|expiry)/i.test(text)) warnings.push('Export docs should explain expiry and deletion of generated archives.');
  return warnings;
}

function recommendationFor(id) {
  return {
    'retention-periods': 'State exact retention periods for each data class.',
    'data-categories': 'Define covered categories: customer data, metadata, logs, audit logs, backups, files, billing.',
    'deletion-api': 'Document deletion endpoints, erasure requests, and purge workflow.',
    'soft-hard-delete': 'Explain soft delete, restore windows, tombstones, hard delete, and permanent purge.',
    'backup-retention': 'Describe backup/snapshot retention and when deleted data disappears from backups.',
    'export-portability': 'Document data export/download and portability formats.',
    'privacy-rights': 'Mention GDPR/CCPA/DSAR rights such as access, erasure, and consent withdrawal.',
    'legal-hold': 'Explain legal hold, fraud/compliance exceptions, and when deletion may be blocked.',
    anonymization: 'Describe anonymization, pseudonymization, redaction, aggregation, or de-identification.',
    'timelines-sla': 'State timelines/SLA for export, deletion, purge, and DSAR completion.',
    'tenant-scope': 'Define account, tenant, workspace, project, or organization scope for retention actions.',
    'webhooks-status': 'Add status tracking, jobs, callbacks, or webhooks for long-running requests.',
    examples: 'Add curl/JSON examples for export, deletion, status, and retention policy endpoints.',
    auditability: 'Mention audit logs, actor, request_id, and trace_id for retention/deletion actions.'
  }[id] || `Improve ${id}.`;
}

export function formatReport(report) {
  const lines = [`${report.passed ? '✅' : '❌'} api-data-retention-doctor score: ${report.score}/100 (minimum ${report.minScore})`, ''];
  for (const c of report.checks) lines.push(`${c.passed ? '✅' : '❌'} ${c.id} (+${c.points}) — ${c.message}`);
  if (report.warnings.length) lines.push('', 'Warnings:', ...report.warnings.map(w => `- ${w}`));
  if (report.recommendations.length) lines.push('', 'Recommendations:', ...report.recommendations.map(r => `- ${r}`));
  return lines.join('\n');
}
