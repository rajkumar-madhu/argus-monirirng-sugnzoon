# Alerts in WeCrew

Create an alert rule to evaluate telemetry and notify a configured destination when its condition is met. Start in **Alerts**, create a rule, and choose the signal you want to evaluate. Available alert types and controls depend on this instance's configuration and permissions.

## Configure a rule

1. Select metrics, logs, or traces. Build a query using telemetry already available in your workspace. Use filters to select the service, host, or other resources you intend to monitor.
2. Preview the query and check its time range, aggregation, grouping, and units. Confirm that it returns the intended data before setting a threshold. An empty result is not evidence of a healthy service.
3. Select the query to evaluate, the comparison condition, and the **Alert Threshold**. Configure the evaluation interval and any duration controls offered by the form. Choose these settings for your service's expected behavior rather than copying an arbitrary threshold.
4. Give the rule a useful name and description. Select a configured **Notification Channel**. Review the destination before using the test-notification control: a successful test sends a real notification.
5. Save the rule and check its subsequent evaluations and notification delivery. A saved rule alone does not prove that telemetry is arriving or that the destination receives messages.

## Metrics

Use a metrics-based alert for a numeric measurement such as host memory usage or an endpoint's error rate. The editor supports a query builder; PromQL and ClickHouse query options are available where offered by the selected alert type.

For a memory-usage investigation, select a memory metric present in your workspace, filter to the intended hosts, inspect its unit and aggregation, and choose an above-threshold condition appropriate for those hosts. Group by host if each host should be evaluated separately. Do not assume that a metric expressed in bytes accepts a threshold expressed in megabytes.

An endpoint error percentage requires both the error population and total request population to be defined consistently. Check the query result and its units before choosing a percentage threshold; metric names and available attributes depend on your instrumentation.

## Logs

Use a log-based alert to evaluate matching log records. Filter by the relevant service and actual fields in your logs, choose an aggregation, and preview the result over the evaluation window.

For timeout errors, first confirm which field or message identifies a timeout in your application. A count of matching records and a percentage of all records measure different things. If using a percentage, verify both populations and the resulting scale before configuring the threshold. This guide does not assume a particular application's log schema.

## Traces

Use a trace-based alert to evaluate matching spans. Filter to the intended service, operation, or other span attributes and inspect the aggregation and duration unit in the preview.

For slow external calls, identify the outgoing spans in your own telemetry, then use an available latency aggregation and a threshold appropriate to that dependency. Confirm that the query selects outgoing calls rather than unrelated server spans; do not assume a universal operation name or attribute set.

## Exceptions

If **Exceptions** is offered by this instance, use it to evaluate a condition in exception data. Confirm that exception telemetry is present, preview the query, and configure the threshold and notification destination using the same review steps above.

## Anomaly

If **Anomaly Detection Alert** is enabled, the rule evaluates deviations from an expected baseline rather than only a fixed threshold. Review the algorithm and seasonality settings exposed by the form and preview the query with representative history. Availability is controlled by this instance's feature configuration; this guide does not promise that the option is enabled everywhere.

## Troubleshooting

- **No data in the preview:** check the time range, filters, and telemetry ingestion before changing thresholds.
- **No alert during evaluation:** the current data may not satisfy the condition. Review the selected query, comparison, threshold, and evaluation settings.
- **Notification not received:** review the configured destination and the result of a deliberate test notification. Ask your workspace administrator to check destination configuration if you cannot manage it.

For implementation details, see the [alert editor](../../frontend/src/container/FormAlertRules/index.tsx) and [alert type definitions](../../frontend/src/container/CreateAlertRule/constants.ts) in this repository.
