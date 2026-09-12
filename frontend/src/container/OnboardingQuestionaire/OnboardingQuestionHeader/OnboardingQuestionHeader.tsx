import { Typography } from '@signozhq/ui/typography';

import brandLogo from '@/assets/Logos/argus-brand-logo.svg';

interface OnboardingQuestionHeaderProps {
	title: string;
	subtitle: string;
}

export function OnboardingQuestionHeader({
	title,
	subtitle,
}: OnboardingQuestionHeaderProps): JSX.Element {
	return (
		<div className="onboarding-header-section">
			<div className="onboarding-header-icon" style={{ width: 120 }}>
				<img src={brandLogo} alt="WeCrew" width="120" height="32" />
			</div>
			<Typography.Title level={4} className="onboarding-header-title">
				{title}
			</Typography.Title>
			<Typography.Text className="onboarding-header-subtitle">
				{subtitle}
			</Typography.Text>
		</div>
	);
}
