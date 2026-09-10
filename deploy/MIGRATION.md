# Migration notes (Argus community fork)

## Not supported

- **SigNoz Cloud** → Argus
- **SigNoz Enterprise (self-hosted or BYOC)** → Argus
- **SigNoz Foundry** managed installs → Argus
- **In-place re-branding** of a production SigNoz deployment while keeping licensing/gateway state

Argus is a **breaking community fork**. Treat it as a new product deployment unless you are explicitly testing compatibility in a non-production environment.

## Legacy `deploy/` directory

Historical SigNoz installs used `install.sh` and Compose/Swarm files under `deploy/`. Those paths are **deprecated and removed** in Argus. The old Foundry migration guide for SigNoz is **not applicable** here.

If you still run a legacy SigNoz Compose stack and want to experiment with Argus:

1. **Back up** ClickHouse volumes and SQLite/Postgres metadata.
2. Deploy Argus as a **parallel stack** with the same ClickHouse schema expectations (`signoz_*` databases).
3. Point collectors at the new Argus query/ingest endpoints only after validation.

Do not assume license keys, gateway URLs, or enterprise feature flags transfer over.

## Data plane compatibility

Argus retains upstream ClickHouse database and table names (`signoz_traces`, `signoz_metrics`, `signoz_logs`, etc.) and upstream collector/schema migrator images. Metadata in Argus's SQL store (users, dashboards, alert rules) uses **Argus** application branding and module paths — export/import tooling from SigNoz Enterprise is not provided.

## Getting help

Open an issue at [github.com/rajkumar-madhu/argus-monirirng-sugnzoon](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues) with your deployment topology and versions. Do not contact SigNoz commercial support for Argus fork issues.
