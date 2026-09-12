import { DataSource } from 'types/common/queryBuilder';
import DOCLINKS from 'utils/docLinks';

export const ALERT_INFO_LINKS = [
	{
		infoText: 'How to create Metrics-based alerts',
		link: DOCLINKS.ALERT_METRICS,
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.METRICS,
	},
	{
		infoText: 'How to create Log-based alerts',
		link: DOCLINKS.ALERT_LOGS,
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.LOGS,
	},
	{
		infoText: 'How to create Trace-based alerts',
		link: DOCLINKS.ALERT_TRACES,
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.TRACES,
	},
];

export const ALERT_CARDS = [
	{
		header: 'Alert on high memory usage',
		subheader: "Monitor your host's memory usage",
		dataSource: DataSource.METRICS,
		link: DOCLINKS.ALERT_METRICS_MEMORY,
	},
	{
		header: 'Alert on slow external API calls',
		subheader: 'Monitor your external API calls',
		dataSource: DataSource.TRACES,
		link: DOCLINKS.ALERT_TRACES_LATENCY,
	},
	{
		header: 'Alert on high percentage of timeout errors in logs',
		subheader: 'Monitor your logs for errors',
		dataSource: DataSource.LOGS,
		link: DOCLINKS.ALERT_LOGS_TIMEOUT,
	},
	{
		header: 'Alert on high error percentage of an endpoint',
		subheader: 'Monitor your API endpoint',
		dataSource: DataSource.METRICS,
		link: DOCLINKS.ALERT_METRICS_ERROR,
	},
];
