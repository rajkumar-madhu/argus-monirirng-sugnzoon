# Argus self-hosted VM on AWS (dev)

Single **EC2** host running Docker Compose:

- Argus community (`ghcr.io/rajkumar-madhu/argus`)
- ClickHouse + ZooKeeper
- `signoz/signoz-otel-collector` (ingest + schema migrator)

Access: **SSM Session Manager** (no SSH). UI on port **80**. OTLP on **4317/4318**.

## Cost (approx, us-east-1 On Demand)

| Item | ~Monthly |
|------|----------|
| EC2 `t3.xlarge` (4 vCPU / 16 GiB) | ~$120 |
| EBS 200 GB gp3 (encrypted) | ~$16 |
| Public IPv4 | ~$3.65 |
| Data transfer | variable |
| **Total (idle-ish)** | **~$140–150** |

No NAT Gateway, no ALB in this layout. Restrict `allowedCidr` before production use.

## Prerequisites

1. AWS credentials (`aws login` / profile) and CDK bootstrap once:
   ```bash
   cd infra/aws-vm/cdk
   npm install
   npx cdk bootstrap aws://ACCOUNT/us-east-1
   ```
2. Publish an Argus image (or override context):
   ```bash
   # from repo root
   make js-build go-build-community docker-build-community
   # tag/push to ghcr.io/rajkumar-madhu/argus:latest
   ```

## Deploy

```bash
cd infra/aws-vm/cdk
npm install
npx cdk deploy ArgusVmDev \
  -c allowedCidr=YOUR.PUBLIC.IP/32 \
  -c instanceType=t3.xlarge \
  -c argusImage=ghcr.io/rajkumar-madhu/argus:latest \
  -c region=us-east-1
```

Outputs: `UiUrl`, `InstanceId`, `SsmCommand`.

First boot installs Docker and runs compose (several minutes). Check:

```bash
aws ssm start-session --target INSTANCE_ID
sudo docker compose -f /opt/argus/docker-compose.yml ps
sudo tail -f /var/log/argus-bootstrap.log
```

## Destroy

```bash
cd infra/aws-vm/cdk
npx cdk destroy ArgusVmDev
```

## Security notes (dev)

- EBS encrypted; IMDSv2 required; SSM only (no SSH key).
- Default `allowedCidr=0.0.0.0/0` is intentional for quick demos — **override** with your IP.
- HTTP only (no ACM/HTTPS yet). Add ALB + certificate for anything beyond a lab.
- ClickHouse ports are not published to the internet in compose (internal Docker network only); OTLP and UI are.

## Not included

- Multi-AZ / HA ClickHouse
- Postgres sqlstore (SQLite on a Docker volume)
- TLS termination
- Private subnets + NAT
