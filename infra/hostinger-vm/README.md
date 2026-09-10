# Argus community on Hostinger KVM (beside WeCrew)

Self-hosted **Argus monitoring** (SigNoz fork) via Docker Compose on an existing Hostinger VPS that already runs WeCrew (`kind-wecrew` + Traefik).

**Do not** use the AWS CDK path (`infra/aws-vm/cdk`). Compose files here are adapted from `infra/aws-vm/vm/`.

## Host assumptions (this deployment)

| Fact | Value |
|------|--------|
| Host | `srv1754783.hstgr.cloud` / `213.210.36.154` |
| Coexists with | WeCrew kind node, Traefik `:80`, LinkedEye Argus UI `:8088` |
| Install dir | `/opt/argus-monitoring` |
| UI | **`:8089`** (Traefik owns `:80`) |
| OTLP | `:4317` (gRPC), `:4318` (HTTP) |
| ClickHouse | **internal only** (host `:9000` already used by uvicorn) |
| Image | `argus-monitoring:hostinger` (built locally; GHCR may be private) |

## Memory caution

kind/`wecrew-control-plane` alone often sits near **~22 GiB**. This stack is capped (~5 GiB total):

| Service | `mem_limit` |
|---------|-------------|
| ZooKeeper | 512m |
| ClickHouse | 2500m (+ query caps in `clickhouse-users-override.xml`) |
| OTel collector | 1g |
| Argus | 1g |
| Schema migrator | 1g (transient) |

If available RAM drops below ~6 GiB before `compose up`, **abort** rather than OOM the host. Prefer freeing kind workloads or a dedicated VM.

## Prerequisites

- SSH as `root` with key auth (`BatchMode`)
- Docker + Compose plugin on the VPS
- Local Mac: Go ≥ 1.25, Node/pnpm, Docker (to build `linux/amd64` image)

## Build image (local) and load on VPS

GHCR (`ghcr.io/rajkumar-madhu/argus`) may return `401` without a token. Prefer local build via `Dockerfile.hostinger` (multi-stage frontend + Go):

```bash
# from repo root (Apple Silicon → linux/amd64)
docker build --platform linux/amd64 \
  -t argus-monitoring:hostinger \
  -f infra/hostinger-vm/Dockerfile.hostinger .

docker save argus-monitoring:hostinger | ssh root@213.210.36.154 'docker load'
```

## Deploy

```bash
# from this machine
rsync -av infra/hostinger-vm/vm/ root@213.210.36.154:/opt/argus-monitoring/

ssh root@213.210.36.154 '
  cd /opt/argus-monitoring
  export ARGUS_IMAGE=argus-monitoring:hostinger
  export ARGUS_EXTERNAL_URL=http://213.210.36.154:8089
  avail_mb=$(awk "/MemAvailable/ {print int(\$2/1024)}" /proc/meminfo)
  if [ "$avail_mb" -lt 6000 ]; then echo "abort: only ${avail_mb}MiB MemAvailable"; exit 1; fi
  docker compose up -d
  docker compose ps
'
```

Compose mounts `clickhouse-cluster.xml` (ZooKeeper + `cluster` remote_servers) so schema migrator with `REPLICATION=true` can succeed.
## Verify

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://213.210.36.154:8089/
curl -sS http://213.210.36.154:13133/   # collector health
ssh root@213.210.36.154 'docker compose -f /opt/argus-monitoring/docker-compose.yml ps'
```

### Endpoints

| What | URL |
|------|-----|
| UI | http://213.210.36.154:8089/ or http://srv1754783.hstgr.cloud:8089/ |
| OTLP gRPC | `213.210.36.154:4317` |
| OTLP HTTP | `http://213.210.36.154:4318` |
| Collector health | http://213.210.36.154:13133/ |

## Hostinger firewall / panel

Open inbound TCP (Firewall in hPanel or `ufw`):

- **8089** — Argus UI
- **4317** — OTLP gRPC
- **4318** — OTLP HTTP
- **13133** — optional (collector health; can leave closed to the public)

Do **not** publish ClickHouse (`8123`/`9000`) to the internet.

## Safety rules

- Never `docker compose down` unrelated stacks; never delete kind/`wecrew-*` / Traefik
- Project name is `argus-monitoring` so containers do not collide with existing `argus-prod-*` (LinkedEye)
- Disk was ~82% full (~72 GiB free) at deploy time — watch ClickHouse volume growth
- No secrets committed; SQLite lives in the `argus-data` Docker volume

## Stop / remove (Argus monitoring only)

```bash
ssh root@213.210.36.154 'cd /opt/argus-monitoring && docker compose down'
# add -v only if you intentionally want to wipe ClickHouse/SQLite data
```

## Relationship to `infra/aws-vm`

| Path | Use |
|------|-----|
| `infra/aws-vm/` | EC2 + CDK bootstrap |
| `infra/hostinger-vm/` | Bare Hostinger KVM next to WeCrew |

Compose logic is the same stack with Hostinger port/memory adaptations.
