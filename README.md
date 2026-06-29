# api-data-retention-doctor

A zero-dependency CLI that grades API data retention and privacy documentation for the details enterprise buyers, privacy teams, and developers expect.

```bash
npx api-data-retention-doctor docs/privacy.md --min-score 85
```

## Checks

- Exact retention periods
- Covered data categories
- Deletion endpoints and erasure workflow
- Soft delete vs hard delete behavior
- Backup/snapshot retention
- Export and portability API
- GDPR, CCPA, DSAR, privacy rights
- Legal holds and exceptions
- Anonymization, pseudonymization, redaction
- Export/deletion timelines and SLA
- Tenant/account/workspace scope
- Status jobs, callbacks, webhooks
- Concrete curl/JSON examples
- Audit trails for retention actions

## Usage

```bash
api-data-retention-doctor README.md
api-data-retention-doctor docs/privacy.md --min-score 90
api-data-retention-doctor docs/privacy.md --json
```

Exit code is non-zero when the score is below the minimum, so it works in CI.

## CI

```yaml
- run: npx api-data-retention-doctor docs/privacy.md --min-score 85
```

## Local development

```bash
npm install
npm run check
```

## License

MIT
