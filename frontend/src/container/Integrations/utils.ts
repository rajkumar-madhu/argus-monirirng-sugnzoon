import { COMMUNITY_URL } from 'constants/app';
import history from 'lib/history';
import { openInNewTab } from 'utils/navigation';

export const handleContactSupport = (isCloudUser: boolean): void => {
	if (isCloudUser) {
		history.push('/support');
	} else {
		openInNewTab(COMMUNITY_URL);
	}
};
