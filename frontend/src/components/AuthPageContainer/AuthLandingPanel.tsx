import './AuthLandingPanel.styles.scss';

const FEATURES = [
	{
		title: 'Traces',
		copy: 'Follow a request across services and see where time is spent.',
	},
	{
		title: 'Metrics',
		copy: 'Watch RED signals and host health without switching tools.',
	},
	{
		title: 'Logs',
		copy: 'Search production logs in the same workspace as the trace.',
	},
];

type AuthLandingPanelProps = {
	variant?: 'signin' | 'signup';
};

function AuthLandingPanel({
	variant = 'signup',
}: AuthLandingPanelProps): JSX.Element {
	const isSignin = variant === 'signin';

	return (
		<section className="auth-landing" aria-label="Argus product overview">
			<p className="auth-landing-kicker">
				{isSignin ? 'Welcome back' : 'OpenTelemetry-native observability'}
			</p>
			<h1 className="auth-landing-title">
				{isSignin ? (
					<>
						Your workspace
						<br />
						is waiting.
					</>
				) : (
					<>
						See everything.
						<br />
						Fix it faster.
					</>
				)}
			</h1>
			<p className="auth-landing-lead">
				{isSignin
					? 'Pick up traces, metrics, and logs in the same Argus workspace you left.'
					: 'Argus brings traces, metrics, and logs into one workspace so you can find the failure without leaving the page.'}
			</p>
			<ul className="auth-landing-features">
				{FEATURES.map((feature) => (
					<li key={feature.title} className="auth-landing-feature">
						<span className="auth-landing-feature-mark" aria-hidden />
						<div>
							<strong>{feature.title}</strong>
							<p>{feature.copy}</p>
						</div>
					</li>
				))}
			</ul>
			<div className="auth-landing-preview" aria-hidden>
				<div className="auth-landing-preview-bar">
					<span />
					<span />
					<span />
				</div>
				<div className="auth-landing-preview-grid">
					<div className="auth-landing-stat">
						<span>p99 latency</span>
						<strong>142ms</strong>
					</div>
					<div className="auth-landing-stat">
						<span>error rate</span>
						<strong>0.4%</strong>
					</div>
					<div className="auth-landing-stat">
						<span>services</span>
						<strong>18</strong>
					</div>
				</div>
			</div>
		</section>
	);
}

export default AuthLandingPanel;
