# Getting started with WeCrew

WeCrew brings traces, metrics and logs into one OpenTelemetry-native workspace.
For a self-hosted deployment, your team manages infrastructure, storage, retention
and backups. The controls available to you depend on your workspace permissions
and deployment configuration.

## Add a data source

From Home, choose **Add your first data source** to open the instrumentation
setup flow. Choose the source that matches your application or infrastructure.
Use the collector endpoint and authentication settings supplied by your workspace
administrator; this guide does not prescribe a public endpoint or credentials.
Configure the source, send telemetry, and then confirm it appears in the relevant
explorer. Finishing a checklist step alone does not prove ingestion is working.

## Ingestion keys

Workspace administrators can open **Settings → Ingestion Settings** to create
and manage ingestion keys when the deployment exposes that feature. Treat a key
as a secret: copy it only to the intended telemetry sender, do not place it in
source control, and revoke or rotate it if it is exposed. The page also shows
the ingestion URL configured for the deployment. Creating a key does not prove
that telemetry is reaching the workspace; verify data in the matching explorer.

## Logs

Open Logs Explorer at `/logs/logs-explorer`. Select a time range that includes
recent application activity, then filter on fields present in your collected logs.
Inspect matching records and adjust the query to narrow an investigation.
If nothing appears, check the time range, filters and ingestion configuration
before concluding that no events occurred.

## Traces

Open Traces Explorer at `/traces-explorer`. Filter collected spans by the service,
operation or other attributes available in your instrumentation. Inspect a trace
to follow a request across instrumented services and investigate latency or
errors. Missing spans may indicate an instrumentation or ingestion gap.

## Metrics

Open Metrics Explorer at `/metrics-explorer/explorer`. Choose a metric collected
by your deployment and review its units, filters, aggregation and time range.
A valid zero measurement differs from a missing result or a query error.
Use measurements actually present in your workspace rather than assuming a
particular metric name exists.

## Alerts

Open Alerts at `/alerts`, or choose **Create Alert Rule** from Home to open
`/alerts/new`. Preview a query against existing telemetry before choosing its
condition and threshold. Configure the intended notification destination and
verify delivery when testing it; tests can send real notifications.
See [Alerts in WeCrew](alerts.md) for signal-specific guidance.

## Dashboards

Open Dashboards at `/dashboard`, or choose **New Dashboard** from Home.
Create a dashboard using the controls available to your account, add panels for
collected telemetry, and review each panel's query and time range before saving.
Home lists recent dashboards; selecting one opens that dashboard.
Viewer accounts do not receive the Home creation action.

## Saved views

Start from the logs, traces or metrics explorer, configure your query, and save
a view using the available controls. Home groups saved views by signal and opens
the selected view in its matching explorer.

The full view lists are available at `/logs/saved-views`,
`/traces/saved-views` and `/metrics-explorer/views`. Saved views preserve a way
to explore telemetry; they do not create telemetry or guarantee that matching
records remain within your retention period.

## Account help

Ask your workspace administrator about access, instrumentation endpoints,
retention and deployment configuration. For a reproducible software problem,
[report an issue](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues)
without including credentials or private telemetry.

The [route definitions](../../frontend/src/constants/routes.ts) and
[Home checklist](../../frontend/src/container/Home/constants.ts) describe the
navigation used by this guide.
