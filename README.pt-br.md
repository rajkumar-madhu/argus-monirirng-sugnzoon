# Argus

**Plataforma de observabilidade comunitária** — logs, métricas, traces, alertas e dashboards em um só lugar, construída com OpenTelemetry.

Argus é um fork comunitário do código MIT-licenciado do [SigNoz](https://github.com/SigNoz/signoz). Os direitos autorais originais da **SigNoz Inc.** são mantidos em `LICENSE`. Argus **não** é afiliado nem endossado pela SigNoz Inc.

## O que é Argus?

Argus oferece uma stack de observabilidade nativa em OpenTelemetry para auto-hospedagem:

- **Logs, métricas e traces** em uma UI unificada
- **Dashboards e alertas** com construtores de consulta flexíveis
- **Armazenamento ClickHouse** para telemetria de alta cardinalidade
- **Somente edição comunitária** — sem cobrança em nuvem, gateway de licença ou módulos enterprise neste fork

## Início rápido

Substitua os placeholders antes de implantar em produção:

| Placeholder | Exemplo |
|-------------|---------|
| Org/repo GitHub | `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` |
| Registry de containers | `ghcr.io/rajkumar-madhu/argus` |
| URL pública | `https://argus.example.com` |

### Compilar a partir do código

```bash
make go-build-community js-build docker-build-community
```

### Executar localmente (desenvolvimento)

```bash
make devenv-up          # ClickHouse + collector OTel upstream
make go-run-community   # Servidor API Argus
```

Consulte [docs/ARGUS.md](docs/ARGUS.md) e [docs/contributing/development.md](docs/contributing/development.md).

### Instalação em produção

Instruções comunitárias em [deploy/README.md](deploy/README.md). Este fork **não** usa SigNoz Foundry nem charts Helm oficiais do SigNoz.

## Compatibilidade upstream

Argus mantém intencionalmente contratos SigNoz upstream:

- Bancos ClickHouse: `signoz_traces`, `signoz_metrics`, `signoz_logs`, `signoz_meter`, `signoz_metadata`, `signoz_index*`
- Imagens collector: `signoz/signoz-otel-collector`, `signoz/signoz-schema-migrator`, `signoz/zookeeper`
- Chaves de consulta: `SIGNOZ_START_TIME`, `SIGNOZ_END_TIME`, `#SIGNOZ_VALUE`
- Tipos de plugin de dashboard: `signoz/*`

## Licença

MIT — veja [LICENSE](LICENSE). Copyright SigNoz original preservado.

## Contribuir

Leia [CONTRIBUTING.md](CONTRIBUTING.md) e abra issues ou PRs em [github.com/rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon).
