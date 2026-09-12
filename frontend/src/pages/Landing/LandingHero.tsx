import styles from './LandingHero.module.scss';
import telemetryCore from '@/assets/WeCrew/telemetry-core.png';

function LandingHero(): JSX.Element {
	return (
		<section className={styles.hero} aria-labelledby="landing-title">
			<div className={styles.copy}>
				<h1 id="landing-title" className={styles.title}>
					Your traces, metrics, and logs.
					<br />
					<span className={styles.accent}>One clear picture.</span>
				</h1>
				<p className={styles.description}>
					Bring your traces, metrics, and logs into one OpenTelemetry-native
					platform, with the freedom to run on your own infrastructure with
					Self-Hosted.
				</p>
				<div className={styles.actions}>
					<a
						className={styles.primary}
						href="#platform"
						data-testid="explore-platform"
					>
						Explore the Platform <span aria-hidden="true">→</span>
					</a>
					<a
						className={styles.secondary}
						href="#self-hosted"
						data-testid="hero-self-hosted"
					>
						Get Started with Self-Hosted
					</a>
				</div>
			</div>
			<figure className={styles.visual}>
				<img
					className={styles.art}
					src={telemetryCore}
					alt=""
					width={1254}
					height={1254}
				/>
				<div className={styles.signalLabels} aria-hidden="true">
					<span>Traces</span>
					<span>Metrics</span>
					<span>Logs</span>
				</div>
				<figcaption className={styles.caption}>
					Illustrative telemetry flow
				</figcaption>
			</figure>
		</section>
	);
}

export default LandingHero;
