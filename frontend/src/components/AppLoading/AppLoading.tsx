import { Typography } from '@signozhq/ui/typography';

import argusBrandLogoUrl from '@/assets/Logos/argus-brand-logo.svg';

import './AppLoading.styles.scss';

function AppLoading(): JSX.Element {
	return (
		<div className="app-loading-container lightMode">
			<div className="perilin-bg" />
			<div className="app-loading-content">
				<div className="brand">
					<img src={argusBrandLogoUrl} alt="WeCrew" className="brand-logo" />

					<Typography.Title level={2} className="brand-title">
						WeCrew
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
