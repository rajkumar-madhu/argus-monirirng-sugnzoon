import { Badge } from '@signozhq/ui/badge';
import { Button } from '@signozhq/ui/button';
import { BellPlus, Infinity as InfinityIcon, Minus } from '@signozhq/icons';
import { getYAxisFormattedValue } from 'components/Graph/yAxisConfig';
import type { SignalLimitItemProps } from './SignalLimitItem';

type Props = Pick<
	SignalLimitItemProps,
	'signalCfg' | 'limit' | 'countToUnit'
> & { onCreateSignalAlert: () => void };

export default function SignalLimitView({
	signalCfg,
	limit,
	countToUnit,
	onCreateSignalAlert,
}: Props): JSX.Element {
	const measurement = signalCfg.usesSize ? 'size' : 'count';
	return (
		<div className="signal-limit-view-mode">
			{(['day', 'second'] as const).map((period) => {
				const configured = limit?.config?.[period]?.[measurement];
				const actual = limit?.metric?.[period]?.[measurement] || 0;
				return (
					<div className="signal-limit-value" key={period}>
						<div className="limit-type">
							<span className="translate-safe">
								{period === 'day' ? 'Daily' : 'Seconds'}
							</span>{' '}
							<Minus size={16} />
						</div>
						<div className="limit-value">
							{configured !== undefined ? (
								signalCfg.usesSize ? (
									<>
										{getYAxisFormattedValue(actual.toString(), 'bytes')} /{' '}
										{getYAxisFormattedValue((configured || 0).toString(), 'bytes')}
									</>
								) : (
									<div style={{ marginTop: 4 }}>
										{countToUnit(actual).value.toFixed(2)} {countToUnit(actual).unit} /{' '}
										{countToUnit(configured || 0).value.toFixed(2)}{' '}
										{countToUnit(configured || 0).unit}
									</div>
								)
							) : (
								<>
									<InfinityIcon size={16} /> NO LIMIT
								</>
							)}
						</div>
						{period === 'day' && configured !== undefined && (
							<Badge
								asChild
								color="cherry"
								variant="outline"
								testId={`set-alert-btn-${signalCfg.name}`}
								className="set-alert-btn"
							>
								<Button onClick={onCreateSignalAlert} size="sm">
									<BellPlus size={12} />
									Set alert
								</Button>
							</Badge>
						)}
					</div>
				);
			})}
		</div>
	);
}
