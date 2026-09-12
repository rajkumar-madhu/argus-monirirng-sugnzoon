import { Typography } from '@signozhq/ui/typography';
import get from 'api/browser/localstorage/get';
import { LOCALSTORAGE } from 'constants/localStorage';
import { THEME_MODE } from 'hooks/useDarkMode/constant';

import argusBrandLogoUrl from '@/assets/Logos/argus-brand-logo.svg';

import './AppLoading.styles.scss';

function AppLoading(): JSX.Element {
	// Get theme from localStorage directly to avoid context dependency
	const getThemeFromStorage = (): boolean => {
		try {
			const theme = get(LOCALSTORAGE.THEME);
			// Only dark when the user explicitly chose dark. Missing/unset = light.
			return theme === THEME_MODE.DARK;
		} catch (error) {
			return false;
		}
	};

	const isDarkMode = getThemeFromStorage();

	return (
		<div className={`app-loading-container ${isDarkMode ? 'dark' : 'lightMode'}`}>
			<div className="perilin-bg" />
			<div className="app-loading-content">
				<div className="brand">
					<img src={argusBrandLogoUrl} alt="Argus" className="brand-logo" />

					<Typography.Title level={2} className="brand-title">
						Argus
					</Typography.Title>
				</div>

				<div className="brand-tagline">
					<Typography.Text>
						OpenTelemetry-Native Logs, Metrics and Traces in a single pane
					</Typography.Text>
				</div>

				<div className="loader" />
			</div>
		</div>
	);
}

export default AppLoading;
