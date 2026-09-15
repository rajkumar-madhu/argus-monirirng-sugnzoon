# Argus community on Hostinger KVM

Self-hosted **Argus monitoring** (SigNoz fork) via Docker Compose on an existing Hostinger VPS. Argus is **not** WeCrew. The same KVM already runs WeCrew (`kind-wecrew` + Traefik) and LinkedEye; keep branding, ports, and compose projects separate.

**Do not** use the AWS CDK path (`infra/aws-vm/cdk`). Compose files here are adapted from `infra/aws-vm/vm/`.

## Coexistence (WeCrew is a neighbor)

| Product | Runtime | Public port | Tear down? |
|---------|---------|-------------|------------|
| **WeCrew** | `kind-wecrew` + Traefik | `:80` | **No** — never `kind delete` / stop Traefik for Argus |
| **LinkedEye** | existing compose (`argus-prod-*`) | `:8088` | **No** |
| **Argus** (this stack) | Compose project `argus-monitoring` | `:8089` | Stop only this project (`docker compose down` in `/opt/argus-monitoring`) |

`wecrew-monitoring-otlp-*.socket` units on the host belong to WeCrew’s in-cluster collector edge. Loopback-bind them; do not treat them as the Argus UI.

## Live deploy (srv1754783)

| Fact | Value |
|------|--------|
| Host | `srv1754783.hstgr.cloud` / `213.210.36.154` |
| Coexists with | WeCrew (`kind-wecrew` + Traefik `:80`), LinkedEye UI `:8088` |
| Install dir | `/opt/argus-monitoring` |
| UI | http://213.210.36.154:8089/ |
| OTLP gRPC | `127.0.0.1:4317` on the VPS (loopback; not on the public NIC) |
| OTLP HTTP | `http://127.0.0.1:4318` on the VPS |
| Collector health | container-local `:13133` (not published on the host) |
| ClickHouse | **internal only** (`25.12.5`; host `:9000` taken by uvicorn). Do **not** use 25.5 — migrator needs `object_serialization_version`. |
| Image | `argus-monitoring:hostinger` (built on VPS; GHCR was `401`) |

## Memory profile (capped)

The WeCrew kind control-plane node alone often sits near **~22 GiB**. This Argus stack is capped:

| Service | `mem_limit` | Observed (idle) |
|---------|-------------|-----------------|
| ZooKeeper | 512m | ~384 MiB |
| ClickHouse | 2500m | ~684 MiB |
| OTel collector | 1g | ~25 MiB |
| Argus | 1g | ~38 MiB |

If available RAM drops below ~5–6 GiB before `compose up`, abort rather than OOM the host.

## Hostinger firewall / hPanel

Open inbound TCP:

- **8089** — Argus UI

Do **not** publish ClickHouse (`8123`/`9000`).

Do **not** open **4317**, **4318**, or **13133**. Compose binds OTLP to `127.0.0.1` and keeps collector health inside the container. The bundled collector has no authenticator or TLS — a public bind plus an open firewall would let anyone inject traces/metrics/logs or flood ClickHouse.

If the live host uses kind (`wecrew-monitoring`) plus systemd `wecrew-monitoring-otlp-*.socket` edge proxies, those sockets must also listen on `127.0.0.1` (see `vm/systemd/`). A `0.0.0.0` socket bypasses the in-cluster `collector-edge` NetworkPolicy: `systemd-socket-proxyd` SNATs through the kind gateway address that policy already allows.

Remote ingest: SSH-tunnel to loopback (below), or set `OTLP_HOST_BIND=0.0.0.0` **and** a source-IP allowlist. Do not leave OTLP open to `0.0.0.0/0`.

## Deploy / rebuild

```bash
# SSH inventory first
ssh -o BatchMode=yes root@213.210.36.154 'hostname; free -h; docker ps --format "{{.Names}}" | head'

# Sync compose assets (and loopback OTLP systemd units)
rsync -av infra/hostinger-vm/vm/ root@213.210.36.154:/opt/argus-monitoring/
ssh root@213.210.36.154 '
  install -m 0644 /opt/argus-monitoring/systemd/wecrew-monitoring-otlp-*.socket /etc/systemd/system/
  systemctl daemon-reload
  systemctl restart wecrew-monitoring-otlp-grpc.socket wecrew-monitoring-otlp-http.socket
'

# Image: GHCR may be private — build on VPS (amd64)
# See Dockerfile.hostinger; clone lives at /opt/argus-monitoring/src
ssh root@213.210.36.154 '
  cd /opt/argus-monitoring
  export ARGUS_IMAGE=argus-monitoring:hostinger
  export ARGUS_EXTERNAL_URL=http://213.210.36.154:8089
  # REQUIRED for anything beyond lab: set JWT secret
  # echo ARGUS_TOKENIZER_JWT_SECRET=$(openssl rand -hex 32) >> .env
  docker compose --env-file .env up -d
  docker compose ps
'
```

### Important: JWT secret

Argus logs a **critical** warning if `ARGUS_TOKENIZER_JWT_SECRET` is unset. For anything beyond a throwaway lab:

```bash
ssh root@213.210.36.154 '
  cd /opt/argus-monitoring
  echo "ARGUS_TOKENIZER_JWT_SECRET=$(openssl rand -hex 32)" >> .env
  chmod 600 .env
  # ensure compose maps ARGUS_TOKENIZER_JWT_SECRET into the argus service
  docker compose --env-file .env up -d --force-recreate argus
'
```

Do not commit `.env`.

## Verify

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://213.210.36.154:8089/
curl -sS http://213.210.36.154:8089/api/v1/version
ssh root@213.210.36.154 'cd /opt/argus-monitoring && docker compose ps otel-collector'
```

Collector health is not on the public host. Confirm `otel-collector` is `healthy` (the compose healthcheck probes `127.0.0.1:13133` inside the container).

First visit completes onboarding (`setupCompleted: false` until you finish the wizard).

## Remote OTLP (SSH tunnel)

From a client that should send telemetry:

```bash
ssh -N -L 4317:127.0.0.1:4317 -L 4318:127.0.0.1:4318 root@213.210.36.154
# then export OTLP to 127.0.0.1:4317 (gRPC) or http://127.0.0.1:4318
```

## Customer HTTP dashboard (Grafana-style Nginx)

Argus ships a 20-panel **Nginx customer overview** (same KPI + traffic + acquisition layout as the [Grafana Loki Nginx dashboard](https://grafana.com/grafana/dashboards/12559-nginx/)). Build it as a **custom dashboard** (not only via the integration):

1. Sign in at http://213.210.36.154:8089/
2. **Dashboards → New dashboard → Import JSON**
3. Upload [`infra/hostinger-vm/dashboards/customer-http.json`](dashboards/customer-http.json) (`name`: `nginx-customer-overview`)
4. Point a collector at access/error logs (`NGINX_ACCESS_LOG_FILE`) and export OTLP to loopback `127.0.0.1:4317` (SSH tunnel above). Combined logs need `attributes.source=nginx`.

Or **Integrations → Nginx → Enable** to provision the same definition from [`pkg/query-service/app/integrations/builtin_integrations/nginx/assets/dashboards/overview.json`](../../pkg/query-service/app/integrations/builtin_integrations/nginx/assets/dashboards/overview.json).

Panels: total/2xx/4xx/5xx requests, bytes, unique visitors, Googlebot, status + bytes time series, method/status mix, top pages/referrers/agents/IPs, live request list. Geo map and p95 latency need extra Nginx `log_format` fields (`$request_time`, GeoIP).

ClickHouse + collector must be running or every panel is empty. Do not start them on this Hostinger box if available RAM is under ~5–6 GiB (kind-wecrew already uses most of the 31 GiB).

## Safety rules

- Never tear down WeCrew (`kind-wecrew`) or Traefik on this host
- Project name `argus-monitoring` avoids colliding with LinkedEye `argus-prod-*`
- Disk was ~82%+ full at deploy — watch ClickHouse volume growth
- Collector healthcheck uses bash `/dev/tcp` (image has no `wget`/`curl`)

## Stop (Argus monitoring only)

```bash
ssh root@213.210.36.154 'cd /opt/argus-monitoring && docker compose down'
# add -v only to wipe ClickHouse/SQLite data
```

## Relationship to `infra/aws-vm`

| Path | Use |
|------|-----|
| `infra/aws-vm/` | EC2 + CDK |
| `infra/hostinger-vm/` | Bare Hostinger KVM (leave WeCrew kind/Traefik alone) |
