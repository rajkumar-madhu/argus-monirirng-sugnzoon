import { useMemo } from 'react';
import { Button } from '@signozhq/ui/button';
import { Skeleton } from 'antd';
import logEvent from 'api/common/logEvent';
import { useGetHosts } from 'api/generated/services/zeus';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import { Link2 } from '@signozhq/icons';
import Card from 'periscope/components/Card/Card';
import { useAppContext } from 'providers/App/App';
import { LicensePlatform } from 'types/api/licensesV3/getActive';
import { openInNewTab } from 'utils/navigation';

import containerPlusUrl from '@/assets/Icons/container-plus.svg';
import hurrayUrl from '@/assets/Icons/hurray.svg';

import { DOCS_LINKS } from '../constants';

import styles from './DataSourceInfo.module.scss';

function DataSourceInfo({
	dataSentToArgus,
	isLoading,
}: {
	dataSentToArgus: boolean;
	isLoading: boolean;
}): JSX.Element {
	const { activeLicense } = useAppContext();

	const notSendingData = !dataSentToArgus;

	const isEnabled =
		activeLicense && activeLicense.platform === LicensePlatform.CLOUD;

	const { data: hostsData, isError } = useGetHosts({
		query: { enabled: isEnabled || false },
	});

	const activeHost = useMemo(
		() =>
			hostsData?.data?.hosts?.find((h) => !h.is_default) ??
			hostsData?.data?.hosts?.find((h) => h.is_default),
		[hostsData],
	);

	const url = useMemo(
		() => activeHost?.url?.split('://')[1] ?? '',
		[activeHost],
	);

	const handleConnect = (): void => {
		void logEvent('Homepage: Connect dataSource clicked', {});

		if (activeLicense && activeLicense.platform === LicensePlatform.CLOUD) {
			history.push(ROUTES.GET_STARTED_WITH_CLOUD);
		} else {
			openInNewTab(DOCS_LINKS.ADD_DATA_SOURCE);
		}
	};

	const renderNotSendingData = (): JSX.Element => (
		<>
			<h1 className={styles.title}>Your Argus workspace</h1>

			<p className={styles.description}>
				Connect a data source to investigate logs, follow traces, and monitor
				services.
			</p>

			<Card className="welcome-card">
				<Card.Content>
					<div className="workspace-ready-container">
						<div className="workspace-ready-header">
							<span className="workspace-ready-title">
								<img src={hurrayUrl} alt="hurray" />
								Your workspace is ready
							</span>

							<Button
								variant="solid"
								color="primary"
								size="sm"
								className="periscope-btn primary"
								prefix={<img src={containerPlusUrl} alt="plus" />}
								onClick={handleConnect}
								data-testid="connect-data-source"
							>
								Connect data source
							</Button>
						</div>

						{!isError && hostsData && (
							<div className="workspace-details">
								<div className="workspace-url">
									<Link2 size={12} />

									<span className="workspace-url-text">{url}</span>
								</div>
							</div>
						)}
					</div>
				</Card.Content>
			</Card>
		</>
	);

	const renderDataReceived = (): JSX.Element => (
		<>
			<h1 className={styles.title}>Your Argus workspace</h1>

			{!isError && hostsData && (
				<Card className="welcome-card">
					<Card.Content>
						<div className="workspace-ready-container">
							<div className="workspace-details">
								<div className="workspace-url">
									<Link2 size={12} />

									<span className="workspace-url-text">{url}</span>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card>
			)}
		</>
	);

	return (
		<section
			className={styles.welcome}
			aria-label="Workspace overview"
			aria-busy={isLoading}
		>
			{isLoading && (
				<>
					<Skeleton.Avatar active size={36} shape="square" />
					<Skeleton active />
				</>
			)}

			{!isLoading && dataSentToArgus && renderDataReceived()}

			{!isLoading && notSendingData && renderNotSendingData()}
		</section>
	);
}

export default DataSourceInfo;
