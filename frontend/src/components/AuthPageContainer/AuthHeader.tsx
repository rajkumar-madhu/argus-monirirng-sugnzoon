import { useCallback } from 'react';
import { Button } from '@signozhq/ui/button';
import { LifeBuoy } from '@signozhq/icons';

import argusBrandLogoUrl from '@/assets/Logos/argus-brand-logo.svg';

import './AuthHeader.styles.scss';

function AuthHeader(): JSX.Element {
	const handleGetHelp = useCallback((): void => {
		window.open('https://argus.example.com/support/', '_blank');
	}, []);

	return (
		<header className="auth-header">
			<div className="auth-header-logo">
				<img
					src={argusBrandLogoUrl}
					alt="Argus"
					className="auth-header-logo-icon"
				/>
				<span className="auth-header-logo-text">Argus</span>
			</div>
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
