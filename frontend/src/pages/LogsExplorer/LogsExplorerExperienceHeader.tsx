import { ExplorerViews } from './utils';

import styles from './LogsExplorerExperienceHeader.module.scss';

interface LogsExplorerExperienceHeaderProps {
	selectedView: ExplorerViews;
	showLiveLogs: boolean;
}

const viewLabels: Record<ExplorerViews, string> = {
	[ExplorerViews.LIST]: 'List',
	[ExplorerViews.TIMESERIES]: 'Timeseries',
	[ExplorerViews.TRACE]: 'Trace',
	[ExplorerViews.TABLE]: 'Table',
	[ExplorerViews.CLICKHOUSE]: 'ClickHouse',
};

function LogsExplorerExperienceHeader({
	selectedView,
	showLiveLogs,
}: LogsExplorerExperienceHeaderProps): JSX.Element {
	const currentViewLabel = viewLabels[selectedView];
	const statusTitle = showLiveLogs
		? 'Live tail is active'
		: `${currentViewLabel} view is ready`;
	const statusDescription = showLiveLogs
		? 'Incoming events appear as they are received. Exit live tail to return to your query results.'
		: 'Build a focused query, choose a time range, and run it to retrieve telemetry.';

	return (
		<header
			className={styles.header}
			data-testid="logs-explorer-experience-header"
		>
			<div className={styles.intro}>
				<p className={styles.eyebrow}>Explore / Logs</p>
				<h1 className={styles.title}>Logs Explorer</h1>
				<p className={styles.description}>
					Search and correlate OpenTelemetry logs across your services. Refine
					results with resource attributes, then continue an investigation in the
					associated trace when trace context is present.
				</p>
			</div>

			<div className={styles.status} aria-live="polite">
				<span className={styles.statusDot} aria-hidden="true" />
				<div>
					<p className={styles.statusTitle}>{statusTitle}</p>
					<p className={styles.statusDescription}>{statusDescription}</p>
				</div>
			</div>

			<ul className={styles.capabilities} aria-label="Logs Explorer capabilities">
				<li>
					<strong>Structured search</strong>
					<span>Query log bodies and resource attributes together.</span>
				</li>
				<li>
					<strong>Signal context</strong>
					<span>
						Open a log&apos;s trace when its trace identifier is available.
					</span>
				</li>
				<li>
					<strong>Investigation views</strong>
					<span>Switch between list, timeseries, and table presentations.</span>
				</li>
			</ul>
		</header>
	);
}

export default LogsExplorerExperienceHeader;
