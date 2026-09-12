# Cold migration and rollback

These are operator-run steps, not a deployment script. Run host commands only
on the verified VPS `213.210.36.154`; run Kubernetes commands only with explicit
context `kind-wecrew` and namespace `wecrew-monitoring`. Do not execute the snippets
until the release and backup gates below pass.

## Before stopping anything

- Record the exact four source image IDs and configuration hashes, volume
  mountpoints, kind node address, current traffic routes and aggregate database
  baselines. Do not dump environment values or database records.
- Verify an enforcing CNI and the allow/deny connectivity cases in README.
  Stage resources with zero replicas. Confirm no destination pods exist.
- Provision the existing JWT via the approved secret workflow, without exposing
  it in command output or this repository. Keep the existing key where possible.
  Before stopping Compose, also preserve that value in a root-readable rollback
  environment file outside this repository and backup directory. Set
  `ARGUS_ROLLBACK_ENV_FILE` to its path, require mode `0600`, and verify it has a
  nonempty `ARGUS_TOKENIZER_JWT_SECRET` entry without displaying the entry. The
  live host has no `/opt/argus-monitoring/.env`; do not invent or depend on one.
- Finish the frontend release and build its reviewed revision. Load the exact
  image into kind, including its digest reference. Confirm the runtime resolves
  that digest with `imagePullPolicy: Never` before application startup.
- Recheck node allocatable resources, actual memory, filesystem free bytes and
  inodes. Local PV capacities do not enforce disk quotas. Reserve room for the
  source data, archives, verification restore and destination simultaneously.
  Verify ClickHouse's runtime nofile limit is at least 262144.
- Choose an approved encrypted off-host backup destination and verify write
  access. A backup only on this VPS is not sufficient.
- Prepare the dedicated restart-managed TCP edge proxy, initially stopped.
  Map host loopback 8089 to node 30089, public ingestion 4317/4318 to node
  30317/30318, and loopback health 13133 to node 30133. Preserve existing
  public ingestion bindings and firewall restrictions. Do not modify unrelated
  Traefik routes or recreate kind.
- Establish a maintenance window and telemetry retry/queue expectations.
  Graceful shutdown alone does not guarantee zero dropped telemetry.

## Stop the source

Run from `/opt/argus-monitoring` on the VPS. Stopping each service separately
keeps the data-store dependencies available until their clients have exited.

```sh
: "${ARGUS_ROLLBACK_ENV_FILE:?set this to the approved root-readable rollback environment file}"
test -r "${ARGUS_ROLLBACK_ENV_FILE}"
test "$(stat -c '%a' "${ARGUS_ROLLBACK_ENV_FILE}")" = "600"
grep -q '^ARGUS_TOKENIZER_JWT_SECRET=..*$' "${ARGUS_ROLLBACK_ENV_FILE}"

docker compose stop -t 120 otel-collector
docker compose stop -t 120 argus
docker compose stop -t 120 clickhouse
docker compose stop -t 120 zookeeper
docker compose ps --all
```

Confirm normal exits and no remaining writer, including a still-running schema
migrator. Abort the copy if shutdown was forced or another container mounts a
source volume writable. Never use `down -v`, prune volumes, or bootstrap schemas.

## Archive and verify

Run as root on the VPS with GNU tar. This creates a fresh restricted directory;
do not reuse a previous migration directory. Tar preserves the whole SQLite
directory, including any WAL files, as well as ClickHouse and ZooKeeper identity.

```sh
set -eu
umask 077
migration_stamp=$(date -u +%Y%m%dT%H%M%SZ)
migration_backup="/opt/argus-monitoring/backups/k8s-${migration_stamp}"
mkdir -p /opt/argus-monitoring/backups
mkdir "${migration_backup}"
for service in argus clickhouse zookeeper; do
  source_volume="argus-monitoring_${service}-data"
  source_dir=$(docker volume inspect --format '{{.Mountpoint}}' "${source_volume}")
  test -d "${source_dir}"
  tar --numeric-owner --acls --xattrs -cpf "${migration_backup}/${service}.tar" -C "${source_dir}" .
  tar --numeric-owner --acls --xattrs -dpf "${migration_backup}/${service}.tar" -C "${source_dir}" >"${migration_backup}/${service}-compare.log" 2>&1
done
(cd "${migration_backup}" && sha256sum argus.tar clickhouse.tar zookeeper.tar > SHA256SUMS && sha256sum -c SHA256SUMS)
```

Stop if any command fails. Copy the archives and checksum manifest through the
approved encrypted off-host backup workflow, verify its stored checksums, and
complete an isolated restore before continuing. Keep compare logs restricted;
they may contain filenames. Do not print archive listings or database contents.

## Restore into the stopped kind node

Confirm `wecrew-control-plane` is the intended node and its `/var` backing
volume is durable. Ensure its tar supports numeric ownership, ACLs and xattrs.
The following refuses nonempty destination directories; investigate existing
data rather than deleting it.

```sh
for service in argus clickhouse zookeeper; do
  target_dir="/var/local/wecrew-monitoring/${service}"
  docker exec wecrew-control-plane sh -eu -c '
    mkdir -p "$1"
    test -z "$(ls -A "$1")"
  ' sh "${target_dir}"
  docker exec -i wecrew-control-plane tar --numeric-owner --same-owner --acls --xattrs -xpf - -C "${target_dir}" <"${migration_backup}/${service}.tar"
  docker exec -i wecrew-control-plane tar --numeric-owner --acls --xattrs -dpf - -C "${target_dir}" <"${migration_backup}/${service}.tar" >"${migration_backup}/${service}-restore-compare.log" 2>&1
done
```

Review all exit codes. Archive/source comparison plus archive/destination
comparison verifies contents and stored metadata; separately verify expected
numeric owners and aggregate file counts/sizes. Keep the source volumes intact.

## Controlled activation

Replace the zero digest in the production overlay with the imported release
image's containerd-resolvable digest. The staging overlay inherits that digest
and the verified edge CIDR while forcing all replicas to zero. Render both,
reject any remaining placeholder, validate them, and save both exact renders as
release records. Apply the staging overlay first and confirm that no destination
pods exist. Then start each deployment in order:

```sh
kubectl --context kind-wecrew apply -k infra/wecrew-k8s-staging
kubectl --context kind-wecrew -n wecrew-monitoring get deployment
kubectl --context kind-wecrew -n wecrew-monitoring get pods

kubectl --context kind-wecrew -n wecrew-monitoring scale deployment/zookeeper --replicas=1
kubectl --context kind-wecrew -n wecrew-monitoring rollout status deployment/zookeeper --timeout=300s
kubectl --context kind-wecrew -n wecrew-monitoring scale deployment/clickhouse --replicas=1
kubectl --context kind-wecrew -n wecrew-monitoring rollout status deployment/clickhouse --timeout=300s
```

Compare aggregate database/table counts, replication status and SQLite integrity
with the pre-cutover baseline. Start the application and collector individually:

```sh
kubectl --context kind-wecrew -n wecrew-monitoring scale deployment/argus --replicas=1
kubectl --context kind-wecrew -n wecrew-monitoring rollout status deployment/argus --timeout=300s
kubectl --context kind-wecrew -n wecrew-monitoring scale deployment/otel-collector --replicas=1
kubectl --context kind-wecrew -n wecrew-monitoring rollout status deployment/otel-collector --timeout=300s
```

Verify `/api/v1/version` reports the reviewed release version, `/api/v2/readyz`
is healthy, and setup state, roles, dashboards and access settings survived.
Verify queryable logs, traces and metrics using a uniquely labeled synthetic canary.
Receiver acceptance and version readiness alone are insufficient.

Start the edge proxy only after all checks pass and Compose has released its
ports. Verify HTTPS, login, deep links, static assets, public OTLP and notification
destinations that were active before migration. Record cutover time and any gap.
After all four manually scaled deployments and public checks pass, apply the
reviewed production overlay so the declared state records one replica for every
workload. Do not reapply the zero-replica staging overlay after release.

```sh
kubectl --context kind-wecrew apply -k infra/wecrew-k8s-production
```

## Rollback

Before production writes, stop the edge proxy, scale destination collector and
app to zero and wait for their pods to terminate, then stop ClickHouse and
ZooKeeper in that order. Preserve destination data for diagnosis. Restart the
unchanged source services individually with the recorded image selection:

```sh
: "${ARGUS_ROLLBACK_ENV_FILE:?set this to the approved root-readable rollback environment file}"
test -r "${ARGUS_ROLLBACK_ENV_FILE}"
test "$(stat -c '%a' "${ARGUS_ROLLBACK_ENV_FILE}")" = "600"
grep -q '^ARGUS_TOKENIZER_JWT_SECRET=..*$' "${ARGUS_ROLLBACK_ENV_FILE}"

docker compose --env-file "${ARGUS_ROLLBACK_ENV_FILE}" up -d --no-deps zookeeper
docker compose --env-file "${ARGUS_ROLLBACK_ENV_FILE}" up -d --no-deps clickhouse
docker compose --env-file "${ARGUS_ROLLBACK_ENV_FILE}" up -d --no-deps argus
docker compose --env-file "${ARGUS_ROLLBACK_ENV_FILE}" up -d --no-deps otel-collector
```

Wait for each dependency to become healthy before the next command. The explicit
`--no-deps` prevents the old schema-migrator dependency from running again.
Verify HTTPS and actual ingestion. Keep the edge proxy stopped so Compose owns
its original ports.

After production writes, the old volumes are stale: do not restart them as
though no writes occurred. Close incoming traffic and quiesce destination
writers, stop databases, then produce verified full cold archives from the
three destination directories with the same procedure. Restore into three
**new** Compose volumes, preserving the original source volumes and backups.
Use a reviewed Compose override mapping only the three data volumes to those
restored volumes; retain the same database/schema versions and verified
application image. Verify integrity and current data before reopening traffic.
If a verified reverse restore cannot be completed, keep traffic closed and
report the failure instead of silently discarding new writes.
