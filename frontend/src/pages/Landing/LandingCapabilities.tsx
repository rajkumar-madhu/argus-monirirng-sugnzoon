import {
	ArrowRight,
	ChartNoAxesCombined,
	GitBranch,
	Server,
} from '@signozhq/icons';
import ROUTES from 'constants/routes';
import { withBasePath } from 'utils/basePath';

import styles from './LandingCapabilities.module.scss';

const capabilities = [
	{
		title: 'Follow every request',
		description:
			'Trace requests across services, see dependencies, and keep the evidence behind an investigation connected.',
		Icon: GitBranch,
	},
	{
		title: 'Understand change',
		description:
			'Explore metrics and structured logs together, then move from a changed signal to the context that explains it.',
		Icon: ChartNoAxesCombined,
	},
	{
		title: 'Keep your data close',
		description:
			'Run WeCrew on infrastructure you control with Self-Hosted deployment guides and OpenTelemetry-native ingestion.',
		Icon: Server,
	},
];

function LandingCapabilities(): JSX.Element {
	return (
		<section
			className={styles.section}
			aria-labelledby="capabilities-title"
			data-testid="landing-capabilities"
		>
			<div className={styles.header}>
				<div>
					<p className={styles.eyebrow}>What you get</p>
					<h2 id="capabilities-title">A clearer path from signal to answer.</h2>
				</div>
				<p>
					WeCrew brings the essential parts of an investigation into one workspace,
					so the next step stays close to the evidence.
				</p>
			</div>
			<div className={styles.grid}>
				{capabilities.map(({ title, description, Icon }) => (
					<article className={styles.card} key={title}>
						<span className={styles.icon} aria-hidden="true">
							<Icon size={22} />
						</span>
						<h3>{title}</h3>
						<p>{description}</p>
					</article>
				))}
			</div>
			<a
				className={styles.workspace}
				href={withBasePath(ROUTES.HOME)}
				data-testid="capabilities-open-workspace"
			>
				Open workspace <ArrowRight size={18} aria-hidden="true" />
			</a>
		</section>
	);
}

export default LandingCapabilities;
