# Argus

**Community-Observability-Plattform** — Logs, Metriken, Traces, Alerts und Dashboards an einem Ort, auf OpenTelemetry aufgebaut.

Argus ist ein Community-Fork des MIT-lizenzierten [SigNoz](https://github.com/SigNoz/signoz)-Codes. Das ursprüngliche Copyright von **SigNoz Inc.** bleibt in `LICENSE` erhalten. Argus ist **nicht** mit SigNoz Inc. verbunden und wird von SigNoz Inc. **nicht** unterstützt.

## Was ist Argus?

Argus bietet einen selbst gehosteten, OpenTelemetry-nativen Observability-Stack:

- **Logs, Metriken und Traces** in einer UI
- **Dashboards und Alerts** mit flexiblen Query-Buildern
- **ClickHouse-Speicher** für hochkardinale Telemetrie
- **Nur Community Edition** — kein Cloud-Billing, kein Lizenz-Gateway, keine Enterprise-Module in diesem Fork

## Schnellstart

Ersetzen Sie Platzhalter vor dem Produktionseinsatz:

| Platzhalter | Beispiel |
|-------------|----------|
| GitHub Org/Repo | `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` |
| Container-Registry | `ghcr.io/rajkumar-madhu/argus` |
| Öffentliche URL | `https://argus.example.com` |

### Aus Quellcode bauen

```bash
make go-build-community js-build docker-build-community
```

### Lokal ausführen (Entwicklung)

```bash
make devenv-up          # ClickHouse + upstream OTel Collector
make go-run-community   # Argus API-Server
```

Siehe [docs/ARGUS.md](docs/ARGUS.md) und [docs/contributing/development.md](docs/contributing/development.md).

### Produktionsinstallation

Community-Installationshinweise in [deploy/README.md](deploy/README.md). Dieser Fork nutzt **kein** SigNoz Foundry und keine offiziellen SigNoz Helm Charts.

## Upstream-Kompatibilität

Argus behält absichtlich SigNoz-Upstream-Verträge bei:

- ClickHouse-Datenbanken: `signoz_traces`, `signoz_metrics`, `signoz_logs`, `signoz_meter`, `signoz_metadata`, `signoz_index*`
- Collector-Images: `signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`, `signoz/zookeeper`
- Query-Keys: `SIGNOZ_START_TIME`, `SIGNOZ_END_TIME`, `#SIGNOZ_VALUE`
- Dashboard-Plugin-Typen: `signoz/*`

## Lizenz

MIT — siehe [LICENSE](LICENSE). SigNoz-Urheberrecht bleibt erhalten.

## Mitwirken

Lesen Sie [CONTRIBUTING.md](CONTRIBUTING.md) und öffnen Sie Issues oder PRs unter [github.com/rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon).
