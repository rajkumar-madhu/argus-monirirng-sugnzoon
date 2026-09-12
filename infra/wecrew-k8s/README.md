# WeCrew monitoring: full-stack Kubernetes migration

Target: context `kind-wecrew`, namespace `wecrew-monitoring`, node
`wecrew-control-plane`, public URL `https://monitoring.wecrew.in`.
This directory stages the application, ClickHouse, ZooKeeper and OpenTelemetry
collector with **zero replicas**. Applying these manifests is not a completed
migration. The final WeCrew landing page and branding must be finished and
verified before the combined production release.

## Storage and compatibility

The existing source is Docker Compose at `/opt/argus-monitoring` on
`213.210.36.154`. Preserve these volumes and their numeric ownership:

| Compose volume | Kubernetes local directory | Mount in workload |
| --- | --- | --- |
| `argus-monitoring_argus-data` | `/var/local/wecrew-monitoring/argus` | `/var/lib/argus` |
| `argus-monitoring_clickhouse-data` | `/var/local/wecrew-monitoring/clickhouse` | `/var/lib/clickhouse` |
| `argus-monitoring_zookeeper-data` | `/var/local/wecrew-monitoring/zookeeper` | `/bitnami/zookeeper` |

Local directories are inside the kind node, whose `/var` is a Docker volume.
They are not the VPS's `/var/local` directory. PVs use explicit node affinity
and `Retain`; they do not provide replication or protection against loss of
the VPS or kind volume. Preserve backups outside that failure domain.

Keep ClickHouse 25.12.5, the existing cluster/shard/replica identity and
ZooKeeper data together. Keep the collector at v0.144.6. Do not run a fresh
schema bootstrap over restored data. Preserve the SQLite WAL files by copying
the entire application data directory after clean shutdown.

## Release gates

1. Complete and browser-verify the approved frontend release. Commit only
   reviewed files and build the AMD64 image from that exact revision using
   `infra/hostinger-vm/Dockerfile.hostinger`. The Dockerfile requires explicit
   version, commit, build-time and branch arguments and injects them into the
   application's existing Go build metadata. Use an immutable revision tag and
   confirm `/api/v1/version` reports that release after startup:

   ```sh
   release_commit=$(git rev-parse HEAD)
   release_branch=$(git rev-parse --abbrev-ref HEAD)
   release_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
   docker build --platform linux/amd64 \
     --build-arg BUILD_VERSION="wecrew-${release_commit}" \
     --build-arg BUILD_COMMIT="${release_commit}" \
     --build-arg BUILD_TIME="${release_time}" \
     --build-arg BUILD_BRANCH="${release_branch}" \
     --tag "argus-monitoring:wecrew-${release_commit}" \
     --file infra/hostinger-vm/Dockerfile.hostinger .
   ```

   Replace the staged all-zero digest only after importing this exact image and
   recording the digest by which the kind container runtime resolves it.
2. Inspect current cluster requests, actual memory and disk availability.
   At discovery, CPU requests were 89%, memory requests 86%, host available
   disk was about 52 GiB, and the live source volumes occupied approximately
   3.4 GiB, mostly ClickHouse. Re-measure after the source is stopped because a
   live ClickHouse merge makes file and size observations unstable.
   These are observations, not capacity guarantees. Do not run duplicate
   stateful stacks on this host during cutover.
3. Record running Compose image IDs, image tags, configuration file hashes,
   volume names, ingress route and node IP. Retain the original image and
   Compose configuration. Transfer existing application JWT configuration to
   Kubernetes Secret `wecrew-monitoring-auth`, key `jwt-secret`, without
   printing or committing its value. If absent, provision a strong secret and
   document that existing sessions may need to sign in again.
4. Render and schema-validate the base, staging and production overlays before
   touching the cluster. Client validation works before the namespace exists:

   ```sh
   kubectl kustomize infra/wecrew-k8s-staging > /tmp/wecrew-monitoring-staging.yaml
   kubectl kustomize infra/wecrew-k8s-production > /tmp/wecrew-monitoring-production.yaml
   kubeconform -strict -summary /tmp/wecrew-monitoring-staging.yaml
   kubeconform -strict -summary /tmp/wecrew-monitoring-production.yaml
   kubectl --context kind-wecrew apply --dry-run=client -k infra/wecrew-k8s-staging
   ```

   A first-run server dry-run of the combined render cannot resolve namespaced
   resources until the namespace exists. Create only the empty namespace, then
   run server dry-run against the zero-replica staging overlay:

   ```sh
   kubectl --context kind-wecrew create namespace wecrew-monitoring \
     --dry-run=client -o yaml | kubectl --context kind-wecrew apply -f -
   kubectl --context kind-wecrew apply --dry-run=server -k infra/wecrew-k8s-staging
   ```

   Load the committed release image into the `wecrew` kind node or use an
   authenticated registry; record the loaded image digest.
5. Prepare local PV directories and ensure all destination workloads remain
   stopped. Schedule a cutover window: client SDK queues/retries must cover
   the ingestion outage, otherwise telemetry during the outage may be lost.

## Cold copy and start order

1. Stop Compose collector, application, ClickHouse, then ZooKeeper using
   `docker compose stop` on named services. Do not use `down -v` or delete
   any source volume. Verify processes have exited cleanly.
2. Archive each complete stopped volume with numeric owner/group and modes.
   Store SHA-256 hashes, verify the archives can be listed and restored, and
   copy an encrypted backup to the approved off-host backup destination.
   Do not log database contents, credentials or user records.
3. Restore archives into the kind node paths above, preserving ownership.
   Compare file counts, sizes and checksums with the stopped source. Never
   attach source and destination databases to the same writable directory.
4. Apply staged resources; start ZooKeeper first, then ClickHouse. Wait for
   readiness after each step. Verify database/schema and table counts against
   a pre-cutover baseline using aggregate results only.
5. Start application and collector. Verify application version and readiness,
   restored setup state, saved dashboards and access settings. Verify traces,
   logs and metrics using a uniquely labelled synthetic canary through OTLP;
   confirm each signal is queryable, not just accepted by the receiver.

## Public traffic

The current host Traefik route points to `127.0.0.1:8089`. The kind node only
publishes host ports 8080, 8443 and its API port; creating a NodePort alone
does not preserve the existing host ports 8089, 4317, 4318 and 13133.

Before switching traffic, configure a dedicated host edge TCP proxy mapping
those four ports to the corresponding NodePorts in `services.yaml`, using the
verified kind node IP. Bind collector health port 13133 to loopback unless
an existing external health consumer requires it. The proxy must start only
after Compose releases these ports. This is an edge forwarding component;
all application and data services run in Kubernetes. Do not recreate the
kind cluster to change its published ports.

Preserve the existing Traefik TLS route and certificate. Verify trusted HTTPS,
HTTP redirect, landing page, login, authentication/deep links and public OTLP
connectivity after the proxy starts. Inspect browser console and missing
assets, including the existing runtime `css/uPlot.min.css` reference.

## Rollback

Keep source volumes, source images and cold archives untouched. Before public
traffic is admitted, rollback is: stop destination workloads and edge proxy,
then restart original Compose services in dependency order and verify HTTPS
and ingestion. Never run both collectors against separate stores unnoticed.

Once Kubernetes accepts production writes, restarting the old volumes would
lose those new writes. Quiesce ingestion and application writes, stop the
destination databases, take a new verified cold snapshot and restore it to
the Compose destination before reopening traffic. Same image/schema versions
are required. Record the cutover time and any telemetry gap explicitly.

Do not delete source volumes or rollback images as part of this release.

## Network isolation and release overlay

Use `-k infra/wecrew-k8s` for the zero-replica base,
`-k infra/wecrew-k8s-staging` for the first-activation render that inherits the
release image and edge CIDR while retaining zero replicas, and
`-k infra/wecrew-k8s-production` for the final one-replica declared state. Do
not apply these directories with `-f`; they contain Kustomize configuration.

The production overlay requests one replica per service. It is a release
template, **not directly deployable**: replace the all-zero application digest
with the reviewed image's real digest and replace `edge-source-cidr` with the
verified source address seen at the receiving pods, normally a single /32.
The staging overlay inherits both values and overrides all replicas to zero.
Record and validate both final renders, apply staging first, and follow the
ordered scale-up in [the migration procedure](migration.md). Apply production
only after all services and public checks pass so the declared state records
one replica per workload.
The app uses `imagePullPolicy: Never`; its exact digest reference must exist
in the kind runtime. Changing to a registry requires a reviewed pull-policy
and authentication change. No credentials belong in these files.

NetworkPolicy denies ingress and egress by default, then permits:
- DNS to verified kube-system CoreDNS pods on TCP/UDP 53.
- Application/collector access to ClickHouse on 8123/9000.
- ClickHouse access to ZooKeeper on 2181 and its own native/replication ports.
- The verified edge proxy source to app 8080 and collector 4317/4318/13133.
- OTLP from explicitly approved pods whose **namespace and pod** both carry
  `wecrew.in/monitoring-otlp-client: "true"`; health access is not granted
  to those telemetry senders.

Verify the actual CNI enforces NetworkPolicy before stopping Compose. Stock
kind networking may not enforce these objects. If enforcement is absent, this
migration is blocked until an approved isolation mechanism is ready; merely
creating policies is not evidence of isolation, and changing the shared
cluster's CNI is not part of applying this directory.

CoreDNS labels, DNS service translation, NodePort source NAT and host-network
traffic behavior depend on the live cluster. Node-originated probe traffic can
be exempt from NetworkPolicy; these policies do not isolate workloads from a
trusted node administrator. Keep host firewall rules and proxy listener
bindings restrictive. Do not solve a failed edge test by allowing 0.0.0.0/0.
If node-local DNS is used, explicitly adapt DNS egress to its verified path.

Application egress to external identity providers, licensing, SMTP and webhooks
is intentionally not guessed. Inventory configured dependencies and add narrow
destination/port policies before release. Standard NetworkPolicy cannot express
FQDN allowlists: use an approved stable destination/proxy or supported CNI policy,
and verify authentication and notification delivery after the change.

Required connectivity evidence before traffic cutover:
- Approved app/collector peers can query ClickHouse; ClickHouse reaches ZooKeeper.
- An unrelated namespace cannot reach either database or ZooKeeper admin port.
- Approved telemetry senders and the host proxy reach OTLP; unapproved pods do not.
- DNS resolution, health probes, login/SSO and configured notification delivery work.
- Public access preserves the existing TLS route and OTLP protocol behavior.

Follow [the cold migration and rollback procedure](migration.md), including
the off-host verified backup gate, before activating the production overlay.
