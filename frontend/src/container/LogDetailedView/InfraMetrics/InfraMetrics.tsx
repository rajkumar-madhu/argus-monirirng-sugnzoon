import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty } from 'antd';
import ArgusRadioGroup from 'components/ArgusRadioGroup/ArgusRadioGroup';
import ROUTES from 'constants/routes';
import { Activity, History, Table } from '@signozhq/icons';
import { DataSource } from 'types/common/queryBuilder';

import { VIEW_TYPES } from './constants';
import NodeMetrics from './NodeMetrics';
import PodMetrics from './PodMetrics';
import ServiceMetrics from './ServiceMetrics';

import './InfraMetrics.styles.scss';

interface MetricsDataProps {
	podName: string;
	nodeName: string;
	hostName: string;
	clusterName: string;
	serviceName?: string;
	timestamp: string;
	dataSource: DataSource.LOGS | DataSource.TRACES;
}

function InfraMetrics({
	podName,
	nodeName,
	hostName,
	clusterName,
	serviceName = '',
	timestamp,
	dataSource = DataSource.LOGS,
}: MetricsDataProps): JSX.Element {
	const [selectedView, setSelectedView] = useState<string>(() => {
		if (serviceName) {
			return VIEW_TYPES.SERVICE;
		}
		return podName ? VIEW_TYPES.POD : VIEW_TYPES.NODE;
	});

	const viewOptions = useMemo(() => {
		const options = [];

		if (serviceName) {
			options.push({
				label: (
					<div className="view-title">
						<Activity size={14} />
						Service
					</div>
				),
				value: VIEW_TYPES.SERVICE,
			});
		}

		options.push({
			label: (
				<div className="view-title">
					<Table size={14} />
					Node
				</div>
			),
			value: VIEW_TYPES.NODE,
		});

		if (podName) {
			options.push({
				label: (
					<div className="view-title">
						<History size={14} />
						Pod
					</div>
				),
				value: VIEW_TYPES.POD,
			});
		}

		return options;
	}, [podName, serviceName]);

	const handleModeChange = (value: string): void => {
		setSelectedView(value);
	};

	if (!podName && !nodeName && !hostName && !serviceName) {
		const emptyStateDescription =
			dataSource === DataSource.TRACES
				? 'No data available. Please select a span containing a service, pod, node, or host attribute to view metrics.'
				: 'No data available. Please select a valid log line containing a service, pod, node, or host attribute to view metrics.';

		return (
			<div className="empty-container">
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={emptyStateDescription}
				/>
			</div>
		);
	}

	return (
		<div className="infra-metrics-container">
			{(hostName || podName) && (
				<div className="infra-metrics-deep-links">
					{hostName ? (
						<Link
							to={`${ROUTES.INFRASTRUCTURE_MONITORING_HOSTS}?search=${encodeURIComponent(hostName)}`}
							target="_blank"
							rel="noreferrer"
						>
							Open host in Infrastructure Monitoring
						</Link>
					) : null}
					{podName ? (
						<Link
							to={`${ROUTES.INFRASTRUCTURE_MONITORING_KUBERNETES}?entity=pod&search=${encodeURIComponent(podName)}`}
							target="_blank"
							rel="noreferrer"
						>
							Open pod in Infrastructure Monitoring
						</Link>
					) : null}
				</div>
			)}
			<ArgusRadioGroup
				value={selectedView}
				onChange={handleModeChange}
				className="views-tabs"
				options={viewOptions}
			/>
			{selectedView === VIEW_TYPES.SERVICE && serviceName && (
				<ServiceMetrics serviceName={serviceName} timestamp={timestamp} />
			)}
			{selectedView === VIEW_TYPES.NODE && (
				<NodeMetrics
					nodeName={nodeName}
					clusterName={clusterName}
					hostName={hostName}
					timestamp={timestamp}
				/>
			)}
			{selectedView === VIEW_TYPES.POD && podName && (
				<PodMetrics
					podName={podName}
					clusterName={clusterName}
					timestamp={timestamp}
				/>
			)}
		</div>
	);
}

export default InfraMetrics;
