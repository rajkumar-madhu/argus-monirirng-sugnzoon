import { Typography } from '@signozhq/ui/typography';
import { COMMUNITY_URL } from 'constants/app';
import { useGetTenantLicense } from 'hooks/useGetTenantLicense';
import history from 'lib/history';
import { ArrowRight } from '@signozhq/icons';
import { openInNewTab } from 'utils/navigation';

import awwSnapUrl from '@/assets/Icons/awwSnap.svg';

import './LogsError.styles.scss';

export default function LogsError(): JSX.Element {
	const { isCloudUser: isCloudUserVal } = useGetTenantLicense();

	const handleContactSupport = (): void => {
		if (isCloudUserVal) {
			history.push('/support');
		} else {
			openInNewTab(COMMUNITY_URL);
		}
	};

	return (
		<div className="logs-error-container">
			<div className="logs-error-content">
				<img src={awwSnapUrl} alt="error-emoji" className="error-state-svg" />
				<Typography.Text>
					<span className="aww-snap">Aw snap :/ </span> Something went wrong. Please
					try again or contact support.
				</Typography.Text>

				<div className="contact-support" onClick={handleContactSupport}>
					<Typography.Link className="text">Contact Support </Typography.Link>

					<ArrowRight size={14} />
				</div>
			</div>
		</div>
	);
}
