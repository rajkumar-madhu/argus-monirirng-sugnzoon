import { PersistedAnnouncementBanner } from '@signozhq/ui/announcement-banner';

import styles from './NoAuthBanner.module.scss';

export function NoAuthBanner(): JSX.Element {
	return (
		<PersistedAnnouncementBanner
			type="warning"
			storageKey="no-auth-banner-v1"
			testId="no-auth-banner"
			className={styles.banner}
		>
			Impersonation mode: authentication is disabled. Anyone with access to this
			instance has admin privileges.{' '}
			<a
				href="https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/getting-started.md#account-help"
				target="_blank"
				rel="noreferrer"
			>
				Learn more
			</a>
		</PersistedAnnouncementBanner>
	);
}

export default NoAuthBanner;
