# Data retention and deletion API

This policy covers customer data, user data, metadata, files, analytics events, billing records, audit logs, and backups for each tenant, workspace, organization, account, and project.

Retention periods:

| Data category | Retention |
|---|---|
| Customer records and files | retained while account is active |
| Soft deleted records | 30 days restore window |
| Audit logs | 7 years |
| Analytics events | 13 months |
| Billing records | 7 years |
| Backups and snapshots | purged within 35 days |

Use the export API for data portability and right to access requests. Archives are JSON or CSV, expire after 7 days, and generated downloads are deleted automatically.

```bash
curl -X POST https://api.example.com/v1/privacy/exports \
  -H "Content-Type: application/json" \
  -d '{"tenant_id":"tenant_123","format":"json","scope":"account"}'
```

Deletion workflow supports GDPR, CCPA, DSAR, right to erasure, and consent withdrawal. A deletion request creates a job with `request_id`, `trace_id`, actor, status, and processing timeline.

```bash
curl -X DELETE https://api.example.com/v1/users/user_123 \
  -H "Authorization: Bearer $TOKEN"
```

Soft delete hides the user immediately and allows restore for 30 days. Hard delete permanently purges primary storage after the restore window. Tombstones remain with anonymous IDs to prevent re-creation conflicts.

Backup deletion: deleted data may remain in encrypted backups and snapshots for up to 35 days, then purge runs automatically. Backups are not used to restore deleted user data except disaster recovery.

Legal hold: deletion can be delayed for litigation, fraud, compliance hold, billing disputes, or records required by law.

Anonymization: analytics and aggregate metrics are de-identified; email, name, and IP address are redacted or pseudonymized after account deletion.

Timelines/SLA: export jobs complete within 48 hours. Deletion requests complete within 30 days. Purge from backups completes within 35 days. Status webhooks send `privacy.export.completed` and `privacy.deletion.completed` notifications.

```bash
curl https://api.example.com/v1/privacy/requests/dsr_123/status
```

Every export, deletion, restore, purge, and legal hold action is written to audit logs with actor, request_id, trace_id, timestamp, and previous state.
