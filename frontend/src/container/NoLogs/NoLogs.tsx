import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import ROUTES from 'constants/routes';
import { useGetTenantLicense } from 'hooks/useGetTenantLicense';
import history from 'lib/history';
import { ArrowUpRight } from '@signozhq/icons';
import { DataSource } from 'types/common/queryBuilder';
import { openInNewTab } from 'utils/navigation';

import eyesEmojiUrl from '@/assets/Images/eyesEmoji.svg';

import './NoLogs.styles.scss';

const WECREW_GETTING_STARTED_URL =
	'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/getting-started.md';

export default function NoLogs({
	dataSource,
}: {
	dataSource: DataSource;
}): JSX.Element {
	const { isCloudUser: isCloudUserVal } = useGetTenantLicense();

	const handleLinkClick = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	): void => {
		e.preventDefault();
		e.stopPropagation();

		if (isCloudUserVal) {
			if (dataSource === DataSource.TRACES) {
				void logEvent('Traces Explorer: Navigate to onboarding', {});
			} else if (dataSource === DataSource.LOGS) {
				void logEvent('Logs Explorer: Navigate to onboarding', {});
			} else if (dataSource === DataSource.METRICS) {
				void logEvent('Metrics Explorer: Navigate to onboarding', {});
			}
			history.push(ROUTES.GET_STARTED_WITH_CLOUD);
		} else if (dataSource === 'traces') {
			openInNewTab(`${WECREW_GETTING_STARTED_URL}#traces`);
		} else if (dataSource === DataSource.METRICS) {
			openInNewTab(`${WECREW_GETTING_STARTED_URL}#metrics`);
		} else {
			openInNewTab(`${WECREW_GETTING_STARTED_URL}#logs`);
		}
	};
	return (
		<div className="no-logs-container">
			<div className="no-logs-container-content">
				<img className="eyes-emoji" src={eyesEmojiUrl} alt="eyes emoji" />
				<Typography className="no-logs-text">
					No {dataSource} yet.
					<span className="sub-text">
						{' '}
						When we receive {dataSource}, they would show up here
					</span>
				</Typography>

				<Typography.Link className="send-logs-link" onClick={handleLinkClick}>
					Sending {dataSource} to WeCrew <ArrowUpRight size={16} />
				</Typography.Link>
			</div>
		</div>
	);
}
