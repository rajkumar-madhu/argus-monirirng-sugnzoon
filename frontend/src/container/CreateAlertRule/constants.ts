import { AlertTypes } from 'types/api/alerts/alertTypes';

// since we don't have a card in alert creation for anomaly based alert

export const ALERT_TYPE_URL_MAP: Record<
	AlertTypes,
	{ selection: string; creation: string }
> = {
	[AlertTypes.METRICS_BASED_ALERT]: {
		selection:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#metrics',
		creation:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#metrics',
	},
	[AlertTypes.LOGS_BASED_ALERT]: {
		selection:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#logs',
		creation:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#logs',
	},
	[AlertTypes.TRACES_BASED_ALERT]: {
		selection:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#traces',
		creation:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#traces',
	},
	[AlertTypes.EXCEPTIONS_BASED_ALERT]: {
		selection:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#exceptions',
		creation:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#exceptions',
	},
	[AlertTypes.ANOMALY_BASED_ALERT]: {
		selection:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#anomaly',
		creation:
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/alerts.md#anomaly',
	},
};

export const ALERT_TYPE_TO_TITLE: Record<AlertTypes, string> = {
	[AlertTypes.METRICS_BASED_ALERT]: 'metric_based_alert',
	[AlertTypes.LOGS_BASED_ALERT]: 'log_based_alert',
	[AlertTypes.TRACES_BASED_ALERT]: 'traces_based_alert',
	[AlertTypes.EXCEPTIONS_BASED_ALERT]: 'exceptions_based_alert',
	[AlertTypes.ANOMALY_BASED_ALERT]: 'anomaly_based_alert',
};
