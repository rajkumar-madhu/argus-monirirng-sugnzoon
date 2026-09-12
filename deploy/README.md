# Deploy Argus (Community)

Argus community installs are **self-managed**. This fork does not ship SigNoz Foundry, official SigNoz Helm charts, or SigNoz Cloud onboarding flows.

## Installation

1. Build or pull the Argus image from your registry (`ghcr.io/rajkumar-madhu/argus`; Go module path stays `github.com/your-org/argus`).
2. Run the upstream OpenTelemetry collector and schema migrator images (`signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`) against ClickHouse (`signoz_*` databases).
3. Configure Argus using [conf/example.yaml](../conf/example.yaml) — set `global.external_url` to your public URL (e.g. `https://argus.example.com` or `https://argus.example.com/argus` when served under a path prefix). Source repo: [rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon).

Full deployment documentation for your organization should live at a URL you control, for example:

**https://argus.example.com/docs/install**

## Deprecated scripts in this directory

- `install.sh` — deprecated; prints a pointer to this README.
- Legacy Docker Compose / Swarm manifests — removed from this fork.

## Migration

**Migrating from SigNoz Cloud, SigNoz Enterprise, or SigNoz Foundry production deployments is not supported by this community fork.**

If you run Argus fresh, plan a new ClickHouse cluster (or reuse an existing cluster only if you understand schema compatibility — see [docs/ARGUS.md](../docs/ARGUS.md)).

See [MIGRATION.md](./MIGRATION.md) for notes on legacy `deploy/` layouts.

## Uninstall / troubleshooting

Use your own runbooks and [GitHub Issues](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues). Argus is not affiliated with SigNoz support channels.
