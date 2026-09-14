import { useMemo, useRef } from 'react';
import { useQueries, UseQueryResult } from 'react-query';
import { generatePath, Link } from 'react-router-dom';
import { Card, Skeleton } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import cx from 'classnames';
import Uplot from 'components/Uplot';
import { ENTITY_VERSION_V4 } from 'constants/app';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { useIsDarkMode } from 'hooks/useDarkMode';
import { useResizeObserver } from 'hooks/useDimensions';
import { GetMetricQueryRange } from 'lib/dashboard/getQueryResults';
import { getUPlotChartOptions } from 'lib/uPlotLib/getUplotChartOptions';
import { getUPlotChartData } from 'lib/uPlotLib/utils/getUplotChartData';
import { useTimezone } from 'providers/Timezone';
import { SuccessResponse } from 'types/api';
import { MetricRangePayloadProps } from 'types/api/metrics/getQueryRange';
import uPlot from 'uplot';

import {
	getServiceLogQueryPayload,
	serviceWidgetInfo,
} from './serviceMetricsQueries';

function ServiceMetrics({
	serviceName,
	timestamp,
}: {
	serviceName: string;
	timestamp: string;
}): JSX.Element {
	const { start, end, verticalLineTimestamp } = useMemo(() => {
		const logTimestamp = dayjs(timestamp);
		const now = dayjs();
		const startTime = logTimestamp.subtract(3, 'hour');
		const endTime = logTimestamp.add(3, 'hour').isBefore(now)
			? logTimestamp.add(3, 'hour')
			: now;

		return {
			start: startTime.unix(),
			end: endTime.unix(),
			verticalLineTimestamp: logTimestamp.unix(),
		};
	}, [timestamp]);

	const legendScrollPositionRef = useRef<{
		scrollTop: number;
		scrollLeft: number;
	}>({
		scrollTop: 0,
		scrollLeft: 0,
	});

	const queryPayloads = useMemo(
		() => getServiceLogQueryPayload(serviceName, start, end),
		[end, serviceName, start],
	);

	const queries = useQueries(
		queryPayloads.map((payload) => ({
			queryKey: ['metrics', payload, ENTITY_VERSION_V4, 'SERVICE_LOGS'],
			queryFn: (): Promise<SuccessResponse<MetricRangePayloadProps>> =>
				GetMetricQueryRange(payload, ENTITY_VERSION_V4),
			enabled: !!payload && !!serviceName,
		})),
	);

	const isDarkMode = useIsDarkMode();
	const graphRef = useRef<HTMLDivElement>(null);
	const dimensions = useResizeObserver(graphRef);
	const chartData = useMemo(
		() => queries.map(({ data }) => getUPlotChartData(data?.payload)),
		[queries],
	);
	const { timezone } = useTimezone();
	const { currentQuery } = useQueryBuilder();

	const options = useMemo(
		() =>
			queries.map(({ data }, idx) =>
				getUPlotChartOptions({
					apiResponse: data?.payload,
					isDarkMode,
					dimensions,
					yAxisUnit: serviceWidgetInfo[idx].yAxisUnit,
					softMax: null,
					softMin: null,
					minTimeScale: start,
					maxTimeScale: end,
					verticalLineTimestamp,
					tzDate: (ts: number) => uPlot.tzDate(new Date(ts * 1e3), timezone.value),
					timezone: timezone.value,
					query: currentQuery,
					legendScrollPosition: legendScrollPositionRef.current,
					setLegendScrollPosition: (position: {
						scrollTop: number;
						scrollLeft: number;
					}) => {
						legendScrollPositionRef.current = position;
					},
				}),
			),
		[
			queries,
			isDarkMode,
			dimensions,
			start,
			end,
			verticalLineTimestamp,
			timezone.value,
			currentQuery,
		],
	);

	const renderCardContent = (
		query: UseQueryResult<SuccessResponse<MetricRangePayloadProps>, unknown>,
		idx: number,
	): JSX.Element => {
		if (query.isLoading) {
			return <Skeleton />;
		}

		if (query.error) {
			const errorMessage =
				(query.error as Error)?.message || 'Something went wrong';
			return <div>{errorMessage}</div>;
		}

		return (
			<div
				className={cx('chart-container', {
					'no-data-container':
						!query.isLoading && !query?.data?.payload?.data?.result?.length,
				})}
			>
				<Uplot options={options[idx]} data={chartData[idx]} />
			</div>
		);
	};

	const serviceMetricsPath = generatePath(ROUTES.SERVICE_METRICS, {
		servicename: encodeURIComponent(serviceName),
	});

	return (
		<div className="infra-metrics-grid">
			<div className="service-metrics-header">
				<Typography.Text>
					Related log metrics for <strong>{serviceName}</strong> (±3h around this
					event)
				</Typography.Text>
				<Link to={serviceMetricsPath} target="_blank" rel="noreferrer">
					Open service metrics
				</Link>
			</div>
			{queries.map((query, idx) => (
				<div key={serviceWidgetInfo[idx].title}>
					<Typography.Text>{serviceWidgetInfo[idx].title}</Typography.Text>
					<Card bordered className="infra-metrics-card" ref={graphRef}>
						{renderCardContent(query, idx)}
					</Card>
				</div>
			))}
		</div>
	);
}

export default ServiceMetrics;
