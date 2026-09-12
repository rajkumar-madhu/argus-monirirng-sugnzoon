import { Typography } from '@signozhq/ui/typography';
import { ArrowRight } from '@signozhq/icons';
import { openInNewTab } from 'utils/navigation';

import emptyStateUrl from '@/assets/Icons/emptyState.svg';

import styles from './EventsNotConfigured.module.scss';

const K8S_EVENTS_DOCS_URL =
	'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/getting-started.md#metrics';

export default function EventsNotConfigured(): JSX.Element {
	const handleLearnMore = (): void => {
		openInNewTab(K8S_EVENTS_DOCS_URL);
	};

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<img src={emptyStateUrl} alt="not-configured" className={styles.icon} />
				<Typography.Text>
					<span className={styles.title}>No Kubernetes events received yet. </span>
					To view events, enable the k8s events receiver in your OpenTelemetry
					Collector.
				</Typography.Text>

				<button
					type="button"
					data-testid="k8s-events-learn-more"
					className={styles.learnMore}
					onClick={handleLearnMore}
					style={{
						background: 'none',
						border: 0,
						padding: 0,
						font: 'inherit',
					}}
				>
					<Typography.Link className={styles.learnMoreText}>
						Learn how to configure
					</Typography.Link>
					<ArrowRight size={14} />
				</button>
			</div>
		</div>
	);
}
