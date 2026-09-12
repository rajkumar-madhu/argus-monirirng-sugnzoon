import ROUTES from 'constants/routes';
import { ArrowRight } from '@signozhq/icons';
import { useId } from 'react';
import { withBasePath } from 'utils/basePath';
import {
	LOG_EVENTS,
	SIGNAL_CONTENT,
	SIGNALS,
	TRACE_SPANS,
} from './signalContent';
import useSignalTabs from './useSignalTabs';
import styles from './SignalExplorer.module.scss';

export default function SignalExplorer(): JSX.Element {
	const { activeSignal, selectSignal, tabRefs, onKeyDown } = useSignalTabs();
	const id = useId();
	const content = SIGNAL_CONTENT[activeSignal];
	return (
		<section
			id="platform"
			className={styles.section}
			aria-labelledby={`${id}-heading`}
		>
			<h2 id={`${id}-heading`} className={styles.heading}>
				Three signals. One investigation.
			</h2>
			<p className={styles.subtitle}>
				Explore traces, metrics, and logs in one connected workflow.
			</p>
			<div
				role="tablist"
				aria-label="Explore telemetry signals"
				className={styles.tabs}
			>
				{SIGNALS.map((signal, index) => (
					<button
						key={signal}
						type="button"
						role="tab"
						id={`${id}-${signal}`}
						data-testid={`signal-tab-${signal}`}
						aria-controls={`${id}-panel`}
						aria-selected={activeSignal === signal}
						tabIndex={activeSignal === signal ? 0 : -1}
						className={styles.tab}
						ref={(element): void => {
							tabRefs.current[index] = element;
						}}
						onClick={(): void => selectSignal(signal)}
						onKeyDown={(event): void => onKeyDown(event, index)}
					>
						{signal}
					</button>
				))}
			</div>
			<div
				id={`${id}-panel`}
				role="tabpanel"
				aria-labelledby={`${id}-${activeSignal}`}
				tabIndex={0}
				data-testid="signal-panel"
				className={styles.panel}
			>
				<figure className={styles.diagram}>
					<div className={styles.diagramHeader}>
						<span>{content.view}</span>
						<span className={styles.viewLabel}>{activeSignal} view</span>
					</div>
					{activeSignal === 'Traces' && (
						<div className={styles.waterfall}>
							{TRACE_SPANS.map((span) => (
								<div className={styles.spanRow} key={span.name}>
									<span className={styles.spanLabel}>{span.name}</span>
									<div className={styles.spanTrack}>
										<span
											className={styles.spanBar}
											style={{ marginLeft: span.offset, width: span.width }}
										/>
									</div>
								</div>
							))}
						</div>
					)}
					{activeSignal === 'Metrics' && (
						<div className={styles.metricChart}>
							<span className={styles.axisLabel}>Relative request duration</span>
							<svg
								className={styles.chart}
								viewBox="0 0 600 230"
								aria-hidden="true"
								focusable="false"
							>
								<path
									d="M0 40H600 M0 100H600 M0 160H600 M0 220H600"
									className={styles.gridLine}
								/>
								<path
									d="M0 170L30 163L60 173L90 155L120 158L150 138L180 148L210 116L240 128L270 72L300 42L330 88L360 73L390 135L420 124L450 153L480 144L510 166L540 152L570 161L600 151"
									className={styles.trendLine}
								/>
							</svg>
							<div className={styles.timeAxis}>
								<span>Earlier</span>
								<span>Example time window →</span>
								<span>Later</span>
							</div>
						</div>
					)}
					{activeSignal === 'Logs' && (
						<ol
							className={styles.logList}
							aria-label="Illustrative related application events"
						>
							{LOG_EVENTS.map((event) => (
								<li className={styles.logEvent} key={event.message}>
									<span className={styles.logLevel}>{event.level}</span>
									<div>
										<span className={styles.logService}>{event.service}</span>
										<p className={styles.logMessage}>{event.message}</p>
										<code className={styles.logAttribute}>{event.attribute}</code>
									</div>
								</li>
							))}
						</ol>
					)}
					<figcaption className={styles.caption}>
						{activeSignal === 'Metrics'
							? 'Request duration rises, peaks, then returns toward its baseline. Illustrative example · not live telemetry'
							: 'Illustrative example · not live telemetry'}
					</figcaption>
				</figure>
				<div className={styles.explanation}>
					<h3 className={styles.detailHeading}>{content.title}</h3>
					<p className={styles.description}>{content.description}</p>
					<dl className={styles.details}>
						<div className={styles.detailRow}>
							<dt className={styles.detailLabel}>Context</dt>
							<dd className={styles.detailValue}>{content.context}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt className={styles.detailLabel}>Signal</dt>
							<dd className={styles.detailValue}>{content.signal}</dd>
						</div>
						<div className={styles.detailRow}>
							<dt className={styles.detailLabel}>Explore</dt>
							<dd className={styles.detailValue}>{content.explore}</dd>
						</div>
					</dl>
					<a
						className={styles.workspace}
						data-testid="signal-workspace"
						href={withBasePath(ROUTES.HOME)}
					>
						Open workspace <ArrowRight size={20} aria-hidden="true" />
					</a>
				</div>
			</div>
		</section>
	);
}
