import { Form, InputNumber, Select } from 'antd';
import { Switch } from '@signozhq/ui/switch';
import { Infinity as InfinityIcon } from '@signozhq/icons';
import type { SignalLimitItemProps } from './SignalLimitItem';

type Props = Pick<
	SignalLimitItemProps,
	'signalCfg' | 'activeSignal' | 'setActiveSignal'
> & { period: 'day' | 'second' };

export default function SignalLimitPeriodEditor({
	period,
	signalCfg,
	activeSignal,
	setActiveSignal,
}: Props): JSX.Element {
	const isDaily = period === 'day';
	const enabled = activeSignal?.config?.[period]?.enabled;
	const sizeField = isDaily ? 'dailyLimit' : 'secondsLimit';
	const countField = isDaily ? 'dailyCount' : 'secondsCount';
	return (
		<div className={isDaily ? 'daily-limit' : 'second-limit'}>
			<div className="heading">
				<div className="title">
					<span className="translate-safe">
						{isDaily ? 'Daily limit' : 'Per Second limit'}
					</span>
					<div className="limit-enable-disable-toggle">
						<Form.Item name={isDaily ? 'enableDailyLimit' : 'enableSecondLimit'}>
							<Switch
								value={enabled}
								data-testid={`enable-${period}-limit`}
								onChange={(value): void => {
									setActiveSignal((prev) =>
										prev
											? {
													...prev,
													config: {
														...prev.config,
														[period]: { ...prev.config?.[period], enabled: value },
													},
												}
											: null,
									);
								}}
							/>
						</Form.Item>
					</div>
				</div>
				<div className="subtitle">
					{isDaily
						? 'Add a limit for data ingested daily'
						: 'Add a limit for data ingested every second'}
				</div>
			</div>
			{signalCfg.usesSize && (
				<div className="size">
					{enabled ? (
						<Form.Item name={sizeField} key={sizeField}>
							<InputNumber
								disabled={!enabled}
								data-testid={`limit-size-${period}`}
								addonAfter={
									<Select defaultValue="GiB" disabled>
										<Select.Option value="TiB">TiB</Select.Option>
										<Select.Option value="GiB">GiB</Select.Option>
										<Select.Option value="MiB">MiB</Select.Option>
										<Select.Option value="KiB">KiB</Select.Option>
									</Select>
								}
							/>
						</Form.Item>
					) : (
						<div className="no-limit">
							<InfinityIcon size={16} /> NO LIMIT
						</div>
					)}
				</div>
			)}
			{signalCfg.usesCount && (
				<div className="count">
					{enabled ? (
						<Form.Item name={countField} key={countField}>
							<InputNumber
								data-testid={`limit-count-${period}`}
								placeholder={
									isDaily ? 'Enter max # of samples/day' : 'Enter max # of samples/s'
								}
								addonAfter={
									<Form.Item
										name={isDaily ? 'dailyCountUnit' : 'secondsCountUnit'}
										noStyle
										initialValue="million"
									>
										<Select style={{ width: 90 }}>
											<Select.Option value="thousand">Thousand</Select.Option>
											<Select.Option value="million">Million</Select.Option>
											<Select.Option value="billion">Billion</Select.Option>
										</Select>
									</Form.Item>
								}
							/>
						</Form.Item>
					) : (
						<div className="no-limit">
							<InfinityIcon size={16} /> NO LIMIT
						</div>
					)}
				</div>
			)}
		</div>
	);
}
