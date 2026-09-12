import { useCallback } from 'react';
import { Button } from '@signozhq/ui/button';
import { LifeBuoy } from '@signozhq/icons';
import DOCLINKS from 'utils/docLinks';
import { openInNewTab } from 'utils/navigation';

import argusMarkUrl from '@/assets/Logos/argus-mark.svg';

import './AuthHeader.styles.scss';

function AuthHeader(): JSX.Element {
	const handleGetHelp = useCallback((): void => {
		openInNewTab(DOCLINKS.USER_GUIDE);
	}, []);

	return (
		<header className="auth-header">
			<a className="auth-header-logo" href="/login" aria-label="Argus home">
				<img src={argusMarkUrl} alt="" className="auth-header-logo-icon" />
				<span className="auth-header-logo-name">Argus</span>
			</a>
			<Button
				className="auth-header-help-button"
				prefix={<LifeBuoy size={12} />}
				onClick={handleGetHelp}
				variant="solid"
				color="none"
			>
				Get Help
			</Button>
		</header>
	);
}

export default AuthHeader;
