# Argus community fork

Argus is a **breaking community fork** of the MIT-licensed SigNoz codebase. It is maintained independently and is **not** affiliated with SigNoz Inc.

## Placeholders to replace

Before publishing images or documentation, search the repository for these placeholders and substitute your values:

| Placeholder | Purpose |
|-------------|---------|
| `github.com/your-org/argus` | Go module import path (stable for builds; **not** the GitHub clone URL) |
| `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` | GitHub clone / issues / PRs |
| `ghcr.io/rajkumar-madhu/argus` | Container images (`docker pull` / release tags) |
| `https://argus.example.com` | Public UI/API URL and email template examples |
| `security@your-org.example` | Security contact (see `SECURITY.md`) |
| `dev@your-org.example` | Code of conduct contact |

Do not rewrite the Go module path to match the GitHub clone URL unless you also update every import and `go.mod`. Configuration path examples use `/argus` as the URL path prefix (see `conf/example.yaml`). ClickHouse **database names** remain `signoz_*` for upstream compatibility.

## Retained upstream contracts

These intentionally keep **SigNoz** naming so existing collectors, schema migrators, and dashboards keep working:

| Area | Retained names |
|------|----------------|
| ClickHouse | `signoz_traces`, `signoz_metrics`, `signoz_logs`, `signoz_meter`, `signoz_metadata`, `signoz_index*` |
| Container images | `signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`, `signoz/zookeeper` |
| Go modules | `github.com/SigNoz/signoz-otel-collector` and other `github.com/SigNoz/*` dependencies |
| Query builder keys | `SIGNOZ_START_TIME`, `SIGNOZ_END_TIME`, `#SIGNOZ_VALUE` |
| Dashboard plugins | Plugin kinds `signoz/*` |
| HTTP header | `SIGNOZ-API-KEY` (default IdentN / collector API key header in config) |
| OpenAPI security name | Generated schema may document `Argus-Api-Key`; runtime default header remains `SIGNOZ-API-KEY` unless you change `identn.apikey.headers` |
| Frontend packages | `@signozhq/*` design-system / UI packages |
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

## OpenAPI and frontend clients

Regenerate the published contract from the community binary (requires Go 1.25.7 toolchain):

```bash
GOTOOLCHAIN=go1.25.7 go run ./cmd/community generate openapi
```

That writes `docs/api/openapi.yml`. Then regenerate Orval clients (requires **pnpm ≥10** and Node ≥22 matching `frontend/package.json` engines):

```bash
cd frontend && pnpm generate:api
```

**Skip note (2026-09-11):** Orval v8.9.1 failed on the regenerated spec with `Cannot read properties of undefined (reading 'properties')` after cleaning the output folder. Existing `frontend/src/api/generated/` clients were restored from git and left unchanged. Re-run `pnpm generate:api` once the Orval/spec issue is fixed (or after upgrading Orval); do not hand-edit generated files.

Do not hand-edit `frontend/src/api/generated/`. Schema names that still contain historical `SigNoz`/`GithubComSigNoz…` fragments come from Go type/package reflection and upstream libraries; treat them as generated artifacts, not product branding.

## Hostinger (shared VPS with WeCrew)

**Argus** (this observability fork) and **WeCrew** (a separate product) share one Hostinger KVM (`213.210.36.154`). They are not the same app. Do not reuse WeCrew colors, copy, cluster, or compose project for Argus — and do not tear WeCrew down to deploy Argus.

| Neighbor | How it runs on the VPS | Public bind | Notes |
|----------|------------------------|-------------|--------|
| **WeCrew** | `kind-wecrew` + Traefik | `:80` (and existing host routes) | Leave this stack running |
| **LinkedEye** | existing compose | `:8088` | Leave those containers alone |
| **Argus** | Docker Compose project `argus-monitoring` in `/opt/argus-monitoring` | `:8089` | This repo’s Hostinger path |

Production-ish compose lives in [`infra/hostinger-vm/`](../infra/hostinger-vm/). See that README for build/load/deploy and safety rules.

**Live check (2026-09-11):** UI `http://213.210.36.154:8089/` returned HTTP 200; WeCrew `kind-wecrew` + Traefik left running. ClickHouse image must be **25.12.5+**. Collector health and OTLP stay off the public NIC (`127.0.0.1` / container-local) — do not probe `:13133` or `:4317`/`:4318` on the host IP.

## Fork verification notes

- OpenAPI product metadata is Argus (`docs/api/openapi.yml` title/contact). Orval regen skipped (v8.9.1 crash on regenerated spec) — keep existing `frontend/src/api/generated/`.
- Focused Go checks with `GOTOOLCHAIN=go1.25.7`: `pkg/config`, `pkg/instrumentation`, `cmd/community`, `pkg/factory` passed.
- Residual `SigNoz` strings remain largely in allowlisted upstream contracts, golden fixtures, attribution, and historical `docs/otel-demo-docs.md` (still SigNoz-flavored; treat as backlog).

## Related docs

- [Development setup](contributing/development.md)
- [Deploy README](../deploy/README.md)
- [Migration notes](../deploy/MIGRATION.md)
- [Self-hosted AWS VM (CDK)](../infra/aws-vm/README.md)
- [Self-hosted Hostinger KVM](../infra/hostinger-vm/README.md)
