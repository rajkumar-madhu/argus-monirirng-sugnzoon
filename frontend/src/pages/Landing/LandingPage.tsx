import { Helmet } from 'react-helmet-async';
import ROUTES from 'constants/routes';
import { withBasePath } from 'utils/basePath';
import brandLogo from '@/assets/Logos/argus-brand-logo.svg';

import LandingCapabilities from './LandingCapabilities';
import LandingHero from './LandingHero';
import SignalExplorer from './SignalExplorer';
import styles from './LandingPage.module.scss';

const sourceUrl = 'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon';
const installUrl = `${sourceUrl}/blob/codex/fix-api-generation/infra/hostinger-vm/README.md`;

function LandingPage(): JSX.Element {
	return (
		<div className={styles.page} data-testid="wecrew-landing">
			<Helmet>
				<title>WeCrew | Traces, metrics, and logs</title>
				<meta
					name="description"
					content="Your traces, metrics, and logs. One clear picture. OpenTelemetry-native observability with the freedom to run Self-Hosted."
				/>
			</Helmet>
			<a className={styles.skipLink} href="#main-content">
				Skip to content
			</a>
			<header className={styles.header}>
				<a href="#main-content" className={styles.brand} aria-label="WeCrew home">
					<img src={brandLogo} alt="WeCrew" width={168} height={45} />
				</a>
				<nav className={styles.navigation} aria-label="Main navigation">
					<a href="#platform">Platform</a>
					<a href="#opentelemetry">OpenTelemetry</a>
					<a href="#self-hosted">Self-Hosted</a>
					<a href="#resources">Resources</a>
				</nav>
				<a
					className={styles.workspace}
					href={withBasePath(ROUTES.HOME)}
					data-testid="open-workspace"
				>
					Open workspace <span aria-hidden="true">→</span>
				</a>
			</header>
			<main id="main-content">
				<LandingHero />
				<LandingCapabilities />
				<section
					id="opentelemetry"
					className={styles.principles}
					aria-label="Platform principles"
				>
					<div>
						<h2>OpenTelemetry-native</h2>
						<p>Built for the standard</p>
					</div>
					<div>
						<h2>Unified observability</h2>
						<p>Traces, metrics, and logs together</p>
					</div>
					<div>
						<h2>Your infrastructure</h2>
						<p>Self-Hosted, your way</p>
					</div>
				</section>
				<SignalExplorer />
				<section
					id="self-hosted"
					className={styles.selfHosted}
					aria-labelledby="self-hosted-title"
				>
					<div>
						<h2 id="self-hosted-title">
							Your infrastructure.
							<br />
							Your observability.
						</h2>
						<p>Run WeCrew on your own infrastructure with Self-Hosted.</p>
						<div className={styles.selfActions}>
							<a
								className={styles.install}
								href={installUrl}
								data-testid="install-guide"
							>
								Get Started with Self-Hosted <span aria-hidden="true">→</span>
							</a>
							<a className={styles.source} href={sourceUrl}>
								View source <span aria-hidden="true">→</span>
							</a>
						</div>
					</div>
					<dl className={styles.steps}>
						<div>
							<dt>Collect</dt>
							<dd>OpenTelemetry-native telemetry</dd>
						</div>
						<div>
							<dt>Understand</dt>
							<dd>Traces, metrics, and logs together</dd>
						</div>
						<div>
							<dt>Deploy</dt>
							<dd>Self-Hosted on your infrastructure</dd>
						</div>
					</dl>
				</section>
			</main>
			<footer id="resources" className={styles.footer}>
				<img src={brandLogo} alt="WeCrew" width={120} height={32} />
				<a href={sourceUrl}>
					OpenTelemetry-native observability <span aria-hidden="true">↗</span>
				</a>
			</footer>
		</div>
	);
}

export default LandingPage;
