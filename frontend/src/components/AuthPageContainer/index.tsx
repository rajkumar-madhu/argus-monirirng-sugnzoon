import { PropsWithChildren, useEffect, useRef } from 'react';
import { useThemeMode } from 'hooks/useDarkMode';
import { THEME_MODE } from 'hooks/useDarkMode/constant';

import AuthFooter from './AuthFooter';
import AuthHeader from './AuthHeader';

import './AuthPageContainer.styles.scss';

type AuthPageContainerProps = PropsWithChildren<{
	isOnboarding?: boolean;
}>;

function AuthPageContainer({
	children,
	isOnboarding = false,
}: AuthPageContainerProps): JSX.Element {
	const { theme, setTheme } = useThemeMode();
	const previousThemeRef = useRef<string | null>(null);

	// Keep auth/landing screens light regardless of the app theme preference.
	useEffect(() => {
		if (previousThemeRef.current === null) {
			previousThemeRef.current = theme;
		}
		setTheme(THEME_MODE.LIGHT);

		return (): void => {
			if (
				previousThemeRef.current &&
				previousThemeRef.current !== THEME_MODE.LIGHT
			) {
				setTheme(previousThemeRef.current);
			}
		};
		// Intentionally run once on mount/unmount for auth layout only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setTheme]);

	return (
		<div className="auth-page-wrapper auth-page-wrapper--light">
			<div className="auth-page-background" aria-hidden>
				<div className="auth-page-dots bg-dot-pattern masked-dots" />
				<div className="auth-page-gradient" />
				<div className="auth-page-line-left" />
				<div className="auth-page-line-right" />
			</div>
			<div className="auth-page-layout">
				<AuthHeader />
				<main
					className={`auth-page-content ${isOnboarding ? 'onboarding-flow' : ''}`}
				>
					{children}
				</main>
				<AuthFooter />
			</div>
		</div>
	);
}

AuthPageContainer.defaultProps = {
	isOnboarding: false,
};

export default AuthPageContainer;
