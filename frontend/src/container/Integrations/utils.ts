import history from 'lib/history';

export const handleContactSupport = (isCloudUser: boolean): void => {
	if (isCloudUser) {
		history.push('/support');
	} else {
		window.open('https://argus.example.com/slack', '_blank');
	}
};
