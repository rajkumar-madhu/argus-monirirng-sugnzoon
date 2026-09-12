import { useCallback } from 'react';
import { Button } from '@signozhq/ui/button';
import { LifeBuoy } from '@signozhq/icons';

import argusBrandLogoUrl from '@/assets/Logos/argus-brand-logo.svg';

import './AuthHeader.styles.scss';

function AuthHeader(): JSX.Element {
	const handleGetHelp = useCallback((): void => {
		window.open(
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
			'_blank',
			'noopener,noreferrer',
		);
	}, []);

	return (
		<header className="auth-header">
			<div className="auth-header-logo">
				<img
					src={argusBrandLogoUrl}
					alt="WeCrew"
					className="auth-header-logo-icon"
					style={{ width: 120, height: 32 }}
				/>
			</div>
			<Button
				className="auth-header-help-button"
				testId="auth-help"
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
