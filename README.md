# Argus

**Community observability platform** — logs, metrics, traces, alerts, and dashboards in one place, built on OpenTelemetry.

Argus is a community fork of the MIT-licensed [SigNoz](https://github.com/SigNoz/signoz) codebase. Original copyright and attribution to **SigNoz Inc.** are retained in `LICENSE`. Argus is **not** affiliated with or endorsed by SigNoz Inc.

<p align="center">
  <a href="README.zh-cn.md">中文</a> ·
  <a href="README.de-de.md">Deutsch</a> ·
  <a href="README.pt-br.md">Português</a>
</p>

## What is Argus?

Argus provides an OpenTelemetry-native observability stack you can run yourself:

- **Logs, metrics, and traces** in a unified UI
- **Dashboards and alerts** with flexible query builders
- **ClickHouse-backed storage** for high-cardinality telemetry
- **Community edition only** — no cloud billing, licensing gateway, or enterprise modules in this fork

## Quick start

Replace placeholders before deploying in production:

| Placeholder | Example |
|-------------|---------|
| GitHub org/repo | `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` |
| Container registry | `ghcr.io/rajkumar-madhu/argus` |
| Public URL | `https://argus.example.com` |

### Build from source

```bash
make go-build-community js-build docker-build-community
```

### Run locally (development)

```bash
make devenv-up          # ClickHouse + upstream OTel collector
make go-run-community   # Argus API server
```

See [docs/ARGUS.md](docs/ARGUS.md) for fork-specific notes and [docs/contributing/development.md](docs/contributing/development.md) for the full dev setup.

### Install for production

Community install paths are documented in [deploy/README.md](deploy/README.md). This fork does **not** use SigNoz Foundry or official SigNoz Helm charts.

## Upstream compatibility

Argus intentionally keeps several SigNoz upstream contracts so existing collectors and migrations continue to work:

- ClickHouse databases: `signoz_traces`, `signoz_metrics`, `signoz_logs`, `signoz_meter`, `signoz_metadata`, `signoz_index*`
- Collector images: `signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`, `signoz/zookeeper`
- Go module: `github.com/SigNoz/signoz-otel-collector` (and other `github.com/SigNoz/*` dependencies)
- Query keys: `SIGNOZ_START_TIME`, `SIGNOZ_END_TIME`, `#SIGNOZ_VALUE`
- Dashboard plugin kinds: `signoz/*`

## Documentation

- [Argus fork guide](docs/ARGUS.md)
- [Contributing](CONTRIBUTING.md)
- [Development setup](docs/contributing/development.md)
- [Integration tests](docs/contributing/tests/integration.md)
- [E2E tests](docs/contributing/tests/e2e.md)

## License

MIT — see [LICENSE](LICENSE). Original SigNoz copyright retained; Argus fork notice included where applicable.

## Contributing

We welcome contributions. Read [CONTRIBUTING.md](CONTRIBUTING.md) and open issues or pull requests at [github.com/rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon).
