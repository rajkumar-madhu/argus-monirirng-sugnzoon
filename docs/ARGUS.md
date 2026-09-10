# Argus community fork

Argus is a **breaking community fork** of the MIT-licensed SigNoz codebase. It is maintained independently and is **not** affiliated with SigNoz Inc.

## Placeholders to replace

Before publishing images or documentation, search the repository for these placeholders and substitute your values:

| Placeholder | Purpose |
|-------------|---------|
| `github.com/your-org/argus` | Go module import path (kept stable; do not confuse with the GitHub clone URL) |
| `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` | GitHub source repository |
| `ghcr.io/rajkumar-madhu/argus` | Container image registry |
| `https://argus.example.com` | Public UI/API URL, email template examples |
| `security@your-org.example` | Security contact (see `SECURITY.md`) |
| `dev@your-org.example` | Code of conduct contact |

Configuration path examples use `/argus` as the URL path prefix (see `conf/example.yaml`). ClickHouse **database names** remain `signoz_*` for upstream compatibility.

## Retained upstream contracts

These intentionally keep **SigNoz** naming so existing collectors, schema migrators, and dashboards keep working:

| Area | Retained names |
|------|----------------|
| ClickHouse | `signoz_traces`, `signoz_metrics`, `signoz_logs`, `signoz_meter`, `signoz_metadata`, `signoz_index*` |
| Container images | `signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`, `signoz/zookeeper` |
| Go modules | `github.com/SigNoz/signoz-otel-collector` and other `github.com/SigNoz/*` dependencies |
| Query builder keys | `SIGNOZ_START_TIME`, `SIGNOZ_END_TIME`, `#SIGNOZ_VALUE` |
| Dashboard plugins | Plugin kinds `signoz/*` |
| HTTP header | `SIGNOZ-API-KEY` (ingestion/API key header) |
| Devenv directory | `.devenv/docker/signoz-otel-collector` (upstream collector image) |

## Enterprise code removed

This fork ships **community edition only**. Removed or stubbed compared to upstream SigNoz Enterprise:

- Cloud licensing gateway and Zeus-backed license flows (test mocks may still exist for legacy integration tests)
- Enterprise-only modules under historical `ee/` paths
- SigNoz Cloud / Foundry install paths (`deploy/install.sh` deprecated)
- Commercial support, Slack, and signoz.io marketing links in project docs

## Application branding

First-party Argus branding applies to:

- Product name in README, emails, and sample config comments
- Go module path: `github.com/your-org/argus`
- Environment variable prefix: `ARGUS_*` (not `SIGNOZ_*`)
- SQLite default path: `argus.db`
- Alertmanager provider key: `argus` (templates use `email.argus.html`)

Frontend product copy, logos, boot globals (`argusBootData`), and first-party component names use Argus. `@signozhq/*` design-system packages and generated OpenAPI client names remain upstream.

## License and copyright

- **License:** MIT — see [LICENSE](../LICENSE).
- **Copyright:** Original SigNoz Inc. copyright lines are **retained**.
- **Fork notice:** Argus additions may append a community fork attribution after the SigNoz copyright where appropriate (email footers, LICENSE addendum).

Do not remove SigNoz attribution. Do not imply official SigNoz endorsement.

## Tests

- Integration/E2E backend fixture: `tests/fixtures/argus.py` (replaces `signoz.py`).
- E2E env vars: `ARGUS_E2E_BASE_URL`, `ARGUS_E2E_USERNAME`, `ARGUS_E2E_PASSWORD`, `ARGUS_E2E_SEEDER_URL`.
- ClickHouse database names in SQL fixtures remain `signoz_*`.

## Related docs

- [Development setup](contributing/development.md)
- [Deploy README](../deploy/README.md)
- [Migration notes](../deploy/MIGRATION.md)
