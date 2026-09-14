import { DashboardtypesPostableDashboardV2DTO } from 'api/generated/services/sigNoz.schemas';
import { DEFAULT_DASHBOARD_ICON_PATH } from 'pages/DashboardPage/DashboardContainer/dashboardIcons';

export interface LogStarterTemplate {
	id: string;
	title: string;
	description: string;
	tags: string[];
	payload: DashboardtypesPostableDashboardV2DTO;
}

const buildStarter = (
	id: string,
	title: string,
	description: string,
	tagValue: string,
): LogStarterTemplate => ({
	id,
	title,
	description,
	tags: [`pack:${tagValue}`, 'signal:logs'],
	payload: {
		schemaVersion: 'v6',
		generateName: true,
		image: DEFAULT_DASHBOARD_ICON_PATH,
		tags: [
			{ key: 'pack', value: tagValue },
			{ key: 'signal', value: 'logs' },
		],
		spec: {
			display: {
				name: title,
				description,
			},
			layouts: [],
			panels: {},
			variables: [],
		},
	},
});

/** Named starter packs for Log Observer–style dashboards (panels empty — fill from Logs Explorer). */
export const LOG_STARTER_TEMPLATES: LogStarterTemplate[] = [
	buildStarter(
		'logs-errors-by-service',
		'Logs · Errors by service',
		'Starter pack for error/fatal log volume by service.name. Open Logs Explorer, filter severity ERROR/FATAL, group by service, then Add to dashboard.',
		'errors-by-service',
	),
	buildStarter(
		'logs-volume-by-severity',
		'Logs · Volume by severity',
		'Starter pack for log volume by severity_text. Open Logs Explorer Advanced search, group by severity, then Add to dashboard.',
		'volume-by-severity',
	),
	buildStarter(
		'logs-top-noisy-sources',
		'Logs · Top noisy sources',
		'Starter pack for the noisiest log producers (service / host). Use Logs Explorer Table view ranked by count, then Add to dashboard.',
		'top-noisy-sources',
	),
];
