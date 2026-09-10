# Argus

**社区版可观测性平台** — 在一个地方统一查看日志、指标、链路、告警和仪表盘，基于 OpenTelemetry 构建。

Argus 是 MIT 许可的 [SigNoz](https://github.com/SigNoz/signoz) 代码库的社区分支。`LICENSE` 中保留了对 **SigNoz Inc.** 的原始版权归属。Argus **与** SigNoz Inc. **无关联，也不受其背书**。

## 什么是 Argus？

Argus 提供可自行部署的 OpenTelemetry 原生可观测性栈：

- **日志、指标和链路** 统一 UI
- **仪表盘和告警**，支持灵活的查询构建器
- **ClickHouse 存储**，适合高基数遥测数据
- **仅社区版** — 此分支不包含云计费、许可网关或企业模块

## 快速开始

生产部署前请替换占位符：

| 占位符 | 示例 |
|--------|------|
| GitHub 组织/仓库 | `github.com/rajkumar-madhu/argus-monirirng-sugnzoon` |
| 容器镜像仓库 | `ghcr.io/rajkumar-madhu/argus` |
| 公开 URL | `https://argus.example.com` |

### 从源码构建

```bash
make go-build-community js-build docker-build-community
```

### 本地运行（开发）

```bash
make devenv-up          # ClickHouse + 上游 OTel collector
make go-run-community   # Argus API 服务
```

详见 [docs/ARGUS.md](docs/ARGUS.md) 和 [docs/contributing/development.md](docs/contributing/development.md)。

### 生产安装

社区安装说明见 [deploy/README.md](deploy/README.md)。此分支**不**使用 SigNoz Foundry 或官方 SigNoz Helm charts。

## 上游兼容性

Argus 有意保留若干 SigNoz 上游约定，以便现有 collector 和 schema 迁移继续工作：

- ClickHouse 数据库：`signoz_traces`、`signoz_metrics`、`signoz_logs`、`signoz_meter`、`signoz_metadata`、`signoz_index*`
- Collector 镜像：`signoz/signoz-otel-collector`、`signoz/signoz-schema-migrator`、`signoz/zookeeper`
- 查询键：`SIGNOZ_START_TIME`、`SIGNOZ_END_TIME`、`#SIGNOZ_VALUE`
- 仪表盘插件类型：`signoz/*`

## 许可证

MIT — 见 [LICENSE](LICENSE)。保留 SigNoz 原始版权。

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，在 [github.com/rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon) 提交 issue 或 PR。
