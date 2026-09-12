export const SIGNALS = ['Traces', 'Metrics', 'Logs'] as const;
export type Signal = (typeof SIGNALS)[number];

export const SIGNAL_CONTENT = {
	Traces: {
		title: 'Follow a request across services.',
		description:
			'Understand service dependencies and investigate where a request spends time.',
		context: 'Service relationships',
		signal: 'Request execution',
		explore: 'Connected telemetry',
		view: 'api-gateway › process-request',
	},
	Metrics: {
		title: 'See patterns. Understand change.',
		description:
			'Explore trends across your services and infrastructure, then investigate the signals behind a change.',
		context: 'Service and infrastructure trends',
		signal: 'Measurements over time',
		explore: 'Related traces and logs',
		view: 'service health › request duration',
	},
	Logs: {
		title: 'Put every event in context.',
		description:
			'Search structured events and follow their trace context to understand what happened across your services.',
		context: 'Structured event attributes',
		signal: 'Application events',
		explore: 'From an event to its trace',
		view: 'api-gateway › request events',
	},
};

export const TRACE_SPANS = [
	{ name: 'HTTP request', offset: '0%', width: '66%' },
	{ name: 'API service', offset: '29%', width: '33%' },
	{ name: 'Database', offset: '67%', width: '16%' },
	{ name: 'Response', offset: '85%', width: '15%' },
];

export const LOG_EVENTS = [
	{
		level: 'INFO',
		service: 'api-gateway',
		message: 'Request received',
		attribute: 'route=/api/search',
	},
	{
		level: 'INFO',
		service: 'search-service',
		message: 'Query started',
		attribute: 'operation=search',
	},
	{
		level: 'WARN',
		service: 'search-service',
		message: 'Cache miss',
		attribute: 'fallback=database',
	},
	{
		level: 'INFO',
		service: 'api-gateway',
		message: 'Response sent',
		attribute: 'status=200',
	},
];
