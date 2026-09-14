import { PANEL_TYPES } from 'constants/queryBuilder';
import { GetQueryResultsProps } from 'lib/dashboard/getQueryResults';
import { DataTypes } from 'types/api/queryBuilder/queryAutocompleteResponse';
import { EQueryType } from 'types/common/dashboard';
import { DataSource, ReduceOperators } from 'types/common/queryBuilder';

const emptyAggregate = {
	dataType: DataTypes.String,
	id: '------false',
	key: '',
	type: '',
};

const serviceNameFilter = (
	serviceName: string,
): {
	items: Array<{
		id: string;
		key: {
			dataType: DataTypes;
			id: string;
			key: string;
			type: string;
		};
		op: string;
		value: string | string[];
	}>;
	op: string;
} => ({
	items: [
		{
			id: 'service-name-filter',
			key: {
				dataType: DataTypes.String,
				id: 'service_name--string--resource--false',
				key: 'service.name',
				type: 'resource',
			},
			op: '=',
			value: serviceName,
		},
	],
	op: 'AND',
});

const errorSeverityFilter = (
	serviceName: string,
): {
	items: Array<{
		id: string;
		key: {
			dataType: DataTypes;
			id: string;
			key: string;
			type: string;
		};
		op: string;
		value: string | string[];
	}>;
	op: string;
} => ({
	items: [
		...serviceNameFilter(serviceName).items,
		{
			id: 'severity-error-filter',
			key: {
				dataType: DataTypes.String,
				id: 'severity_text--string----false',
				key: 'severity_text',
				type: '',
			},
			op: 'in',
			value: ['ERROR', 'FATAL', 'error', 'fatal'],
		},
	],
	op: 'AND',
});

const baseLogCountQuery = (
	serviceName: string,
	start: number,
	end: number,
	filters: ReturnType<typeof serviceNameFilter>,
	legend: string,
): GetQueryResultsProps => ({
	selectedTime: 'GLOBAL_TIME',
	graphType: PANEL_TYPES.TIME_SERIES,
	query: {
		builder: {
			queryData: [
				{
					aggregateAttribute: emptyAggregate,
					aggregateOperator: 'count',
					dataSource: DataSource.LOGS,
					disabled: false,
					expression: 'A',
					filters,
					functions: [],
					groupBy: [],
					having: [],
					legend,
					limit: null,
					orderBy: [],
					queryName: 'A',
					reduceTo: ReduceOperators.AVG,
					spaceAggregation: 'sum',
					stepInterval: 60,
					timeAggregation: 'rate',
				},
			],
			queryFormulas: [],
			queryTraceOperator: [],
		},
		clickhouse_sql: [{ disabled: false, legend: '', name: 'A', query: '' }],
		id: `service-log-metrics-${legend}`,
		promql: [{ disabled: false, legend: '', name: 'A', query: '' }],
		queryType: EQueryType.QUERY_BUILDER,
	},
	variables: {},
	formatForWeb: false,
	start,
	end,
});

/** Log volume + error log volume for a service around a log event. */
export const getServiceLogQueryPayload = (
	serviceName: string,
	start: number,
	end: number,
): GetQueryResultsProps[] => [
	baseLogCountQuery(
		serviceName,
		start,
		end,
		serviceNameFilter(serviceName),
		'All logs',
	),
	baseLogCountQuery(
		serviceName,
		start,
		end,
		errorSeverityFilter(serviceName),
		'Error / fatal logs',
	),
];

export const serviceWidgetInfo = [
	{
		title: 'Log volume',
		yAxisUnit: 'short',
	},
	{
		title: 'Error / fatal log volume',
		yAxisUnit: 'short',
	},
];
