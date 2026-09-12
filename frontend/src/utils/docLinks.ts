import {
	DOCS_BASE_URL,
	GITHUB_REPO_URL,
	INSTRUMENTATION_DOCS_URL,
} from 'constants/app';

const ARGUS_FORK_DOCS = `${GITHUB_REPO_URL}/blob/HEAD/docs/ARGUS.md`;
const ARGUS_SECURITY_DOCS = `${GITHUB_REPO_URL}/blob/HEAD/SECURITY.md`;

const usesUpstreamOrGithubHost = (base: string): boolean =>
	base.includes('signoz.io') || base.includes('github.com');

const docs = (path: string): string => {
	if (path.includes('/instrumentation')) {
		if (!usesUpstreamOrGithubHost(DOCS_BASE_URL)) {
			return `${DOCS_BASE_URL}${path}`;
		}
		return INSTRUMENTATION_DOCS_URL;
	}
	if (usesUpstreamOrGithubHost(DOCS_BASE_URL)) {
		if (
			path.startsWith('/privacy') ||
			path.startsWith('/security') ||
			path.startsWith('/terms')
		) {
			return ARGUS_SECURITY_DOCS;
		}
		return ARGUS_FORK_DOCS;
	}
	return `${DOCS_BASE_URL}${path}`;
};

export const resolveDocsUrl = (pathOrUrl: string): string => {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}
	return docs(pathOrUrl);
};

const DOCLINKS = {
	ROOT: docs('/docs'),
	PRIVACY: docs('/privacy/'),
	SECURITY: docs('/security/'),
	TERMS: docs('/terms-of-service'),
	USER_GUIDE: docs('/docs/introduction/'),
	TRACES_EXPLORER_EMPTY_STATE: docs(
		'/docs/instrumentation/overview/?utm_source=product&utm_medium=traces-explorer-empty-state',
	),
	TRACES_DETAILS_LINK: docs(
		'/docs/userguide/traces/?utm_source=product&utm_medium=traces-explorer-trace-tab#traces-view',
	),
	TRACES_TOOLBAR: docs(
		'/docs/userguide/traces/?utm_source=product&utm_medium=trace-explorer-toolbar',
	),
	LOGS_TOOLBAR: docs(
		'/docs/userguide/logs_query_builder/?utm_source=product&utm_medium=logs-explorer-toolbar',
	),
	METRICS_EXPLORER_EMPTY_STATE: docs('/docs/metrics-management/send-metrics/'),
	EXTERNAL_API_MONITORING: docs('/docs/external-api-monitoring/overview/'),
	QUERY_CLICKHOUSE_TRACES: docs(
		'/docs/userguide/writing-clickhouse-traces-query/#timestamp-bucketing',
	),
	QUERY_CLICKHOUSE_LOGS: docs('/docs/userguide/logs_clickhouse_queries/'),
	QUERY_CLICKHOUSE_METRICS: docs(
		'/docs/userguide/write-a-metrics-clickhouse-query/',
	),
	AGENT_SKILL_INSTALL: docs('/docs/ai/agent-skills/#install-the-plugin'),
	INSTRUMENTATION: docs('/docs/instrumentation/overview/'),
	LOGS_QUERY_BUILDER: docs('/docs/userguide/logs_query_builder/'),
	TRACES_GUIDE: docs('/docs/userguide/traces/'),
	METRICS_EXPLORER: docs('/docs/metrics-management/metrics-explorer/'),
	METRICS_SAVED_VIEWS: docs(
		'/docs/metrics-management/metrics-explorer/#saved-views-in-metrics-explorer',
	),
	MANAGE_DASHBOARDS: docs('/docs/userguide/manage-dashboards/'),
	MANAGE_DASHBOARDS_EMPTY: docs(
		'/docs/userguide/manage-dashboards?utm_source=product&utm_medium=dashboard-list-empty-state',
	),
	ALERTS: docs('/docs/alerts/'),
	ALERTS_LIST: docs('/docs/alerts/?utm_source=product&utm_medium=list-alerts'),
	RETENTION: docs('/docs/userguide/retention-period/'),
	SEND_LOGS: docs('/docs/logs-management/send-logs-to-signoz/'),
	CORRELATE_TRACES_LOGS: docs(
		'/docs/traces-management/guides/correlate-traces-and-logs/',
	),
	ALERT_METRICS: docs(
		'/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
	),
	ALERT_LOGS: docs(
		'/docs/alerts-management/log-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
	),
	ALERT_TRACES: docs(
		'/docs/alerts-management/trace-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
	),
	ALERT_METRICS_MEMORY: docs(
		'/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-memory-usage-for-host-goes-above-400-mb-or-any-fixed-memory',
	),
	ALERT_TRACES_LATENCY: docs(
		'/docs/alerts-management/trace-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-external-api-latency-p90-is-over-1-second-for-last-5-mins',
	),
	ALERT_LOGS_TIMEOUT: docs(
		'/docs/alerts-management/log-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-percentage-of-redis-timeout-error-logs-greater-than-7-in-last-5-mins',
	),
	ALERT_METRICS_ERROR: docs(
		'/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page#3-alert-when-the-error-percentage-for-an-endpoint-exceeds-5',
	),
};

export default DOCLINKS;
