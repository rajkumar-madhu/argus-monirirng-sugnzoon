export const infoData = [
	{
		id: 'infoBlock-1',
		title: 'Traces',
		description:
			'Follow requests across instrumented services to investigate latency and errors.',
	},
	{
		id: 'infoBlock-2',
		title: 'Metrics',
		description:
			'Explore collected measurements and trends for your services and infrastructure.',
	},
	{
		id: 'infoBlock-3',
		title: 'Logs',
		description:
			'Search collected application logs and use their context during an investigation.',
	},
];

export const enterpriseGradeValuesData = [
	{ title: 'OpenTelemetry-native traces, metrics and logs' },
	{ title: 'Dashboards and alerts for collected telemetry' },
	{ title: 'Self-hosted deployment on your infrastructure' },
];

export const faqData = [
	{
		key: 'self-hosted-observability',
		label: 'What is WeCrew self-hosted observability?',
		children:
			'WeCrew brings traces, metrics and logs into one OpenTelemetry-native platform that you can run on your own infrastructure. Your team manages deployment, storage, retention and backups.',
	},
	{
		key: 'collecting-telemetry',
		label: 'How does telemetry reach the workspace?',
		children:
			'Instrument your applications with OpenTelemetry and configure them to send telemetry to your deployment’s collector. Available data depends on the sources your team has connected.',
	},
	{
		key: 'workspace-access',
		label: 'Who can help restore workspace access?',
		children:
			'Contact your workspace administrator to review the deployment’s license and account status. Account actions shown on this screen remain subject to your permissions.',
	},
	{
		key: 'retention-and-backups',
		label: 'Who manages data retention and backups?',
		children:
			'For a self-hosted deployment, your team configures retention and maintains backups. Ask your administrator about the policies and recovery procedures for this workspace.',
	},
];
