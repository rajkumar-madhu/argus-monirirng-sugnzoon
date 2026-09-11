# Argus community on Hostinger KVM (beside WeCrew)

Self-hosted **Argus monitoring** (SigNoz fork) via Docker Compose on an existing Hostinger VPS that already runs WeCrew (`kind-wecrew` + Traefik).

**Do not** use the AWS CDK path (`infra/aws-vm/cdk`). Compose files here are adapted from `infra/aws-vm/vm/`.

## Live deploy (srv1754783)

| Fact | Value |
|------|--------|
| Host | `srv1754783.hstgr.cloud` / `213.210.36.154` |
| Coexists with | WeCrew kind node, Traefik `:80`, LinkedEye Argus UI `:8088` |
| Install dir | `/opt/argus-monitoring` |
| UI hostname | https://monitoring.wecrew.in/ (requires successful certificate issuance) |
| Direct UI | http://213.210.36.154:8089/ |
| OTLP gRPC | `213.210.36.154:4317` |
| OTLP HTTP | `http://213.210.36.154:4318` |
| Collector health | http://213.210.36.154:13133/ |
| ClickHouse | **internal only** (`25.12.5`; host `:9000` taken by uvicorn). Do **not** use 25.5 — migrator needs `object_serialization_version`. |
| Image | `argus-monitoring:hostinger` (built on VPS; GHCR was `401`) |

## Memory profile (capped)

kind/`wecrew-control-plane` alone often sits near **~22 GiB**. This stack is capped:

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
- **4317** — OTLP gRPC
- **4318** — OTLP HTTP
- **13133** — optional (collector health)

Do **not** publish ClickHouse (`8123`/`9000`).

## Deploy / rebuild

```bash
# SSH inventory first
ssh -o BatchMode=yes root@213.210.36.154 'hostname; free -h; docker ps --format "{{.Names}}" | head'

# Sync compose assets
rsync -av infra/hostinger-vm/vm/ root@213.210.36.154:/opt/argus-monitoring/

# Image: GHCR may be private — build on VPS (amd64)
# See Dockerfile.hostinger; clone lives at /opt/argus-monitoring/src
ssh root@213.210.36.154 '
  cd /opt/argus-monitoring
  export ARGUS_IMAGE=argus-monitoring:hostinger
  export ARGUS_EXTERNAL_URL=https://monitoring.wecrew.in
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
curl -sS http://213.210.36.154:13133/
```

First visit completes onboarding (`setupCompleted: false` until you finish the wizard).

## Safety rules

- Never tear down WeCrew / kind / Traefik
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
| `infra/hostinger-vm/` | Bare Hostinger KVM next to WeCrew |

## Monitoring hostname and Traefik

Create the Hostinger DNS A record `monitoring` pointing to `213.210.36.154`,
with TTL 300 seconds. The checked-in `traefik/argus-monitoring.yml` routes
`monitoring.wecrew.in` to `http://127.0.0.1:8089`. This configuration requires
the existing Traefik host network, `websecure` entry point, `letsencrypt`
resolver, and watched `/docker/traefik/dynamic` directory. The existing
Traefik configuration redirects HTTP to HTTPS.

Install this file as `/docker/traefik/dynamic/argus-monitoring.yml` on the VPS.
Use a temporary filename without a `.yml` or `.yaml` suffix and an atomic
rename so the watcher sees a complete file. No Traefik restart is required.
The Compose default and `argus.yaml` both use `https://monitoring.wecrew.in`;
any explicit `ARGUS_EXTERNAL_URL` override must match.

Verify DNS and certificate issuance before advertising HTTPS as ready:

```bash
dig @1.1.1.1 monitoring.wecrew.in A +short
curl --fail --show-error --head https://monitoring.wecrew.in/
curl --fail --show-error https://monitoring.wecrew.in/api/v1/version
```

A DNS record or HTTP redirect alone does not prove certificate issuance.
If ACME secondary validation reports a DNS lookup error, allow DNS caches
to expire before retrying; do not bypass TLS verification.
