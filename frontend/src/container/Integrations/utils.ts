import history from 'lib/history';

export const handleContactSupport = (isCloudUser: boolean): void => {
	if (isCloudUser) {
		history.push('/support');
	} else {
		window.open(
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
			'_blank',
			'noreferrer',
		);
	}
};
