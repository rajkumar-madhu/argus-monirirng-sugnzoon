import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import { ALERTS_DATA_SOURCE_MAP } from 'constants/alerts';
import { FeatureKeys } from 'constants/features';
import { useAppContext } from 'providers/App/App';
import { AlertTypes } from 'types/api/alerts/alertTypes';
import { isModifierKeyPressed } from 'utils/app';
import { openInNewTab } from 'utils/navigation';

import { ALERT_TYPE_URL_MAP } from '../constants';
import { getOptionList } from './config';
import { AlertTypeCard, SelectTypeContainer } from './styles';
import { OptionType } from './types';

function SelectAlertType({ onSelect }: SelectAlertTypeProps): JSX.Element {
	const { t } = useTranslation(['alerts']);
	const { featureFlags } = useAppContext();

	const isAnomalyDetectionEnabled =
		featureFlags?.find((flag) => flag.name === FeatureKeys.ANOMALY_DETECTION)
			?.active || false;

	const optionList = getOptionList(t, isAnomalyDetectionEnabled);

	function handleRedirection(option: AlertTypes): void {
		const url = ALERT_TYPE_URL_MAP[option]?.selection || '';

		logEvent('Alert: Sample alert link clicked', {
			dataSource: ALERTS_DATA_SOURCE_MAP[option],
			link: url,
			page: 'New alert data source selection page',
		});

		openInNewTab(url);
	}
	const renderOptions = useMemo(
		() => (
			<>
				{optionList.map((option: OptionType) => (
					<AlertTypeCard
						key={option.selection}
						title={option.title}
						extra={option.isBeta ? <Badge color="robin">Beta</Badge> : undefined}
						onClick={(e): void => {
							onSelect(option.selection, isModifierKeyPressed(e));
						}}
						data-testid={`alert-type-card-${option.selection}`}
					>
						{option.description}{' '}
						<Typography.Link
							onClick={(e): void => {
								e.preventDefault();
								e.stopPropagation();
								handleRedirection(option.selection);
							}}
						>
							Click here to see how to create a sample alert.
						</Typography.Link>{' '}
					</AlertTypeCard>
				))}
			</>
		),
		[onSelect, optionList],
	);

	return (
		<SelectTypeContainer>
			<Typography.Title
				level={4}
				style={{
					padding: '0 8px',
				}}
			>
				{t('choose_alert_type')}
			</Typography.Title>
			<Row>{renderOptions}</Row>
		</SelectTypeContainer>
	);
}

interface SelectAlertTypeProps {
	onSelect: (type: AlertTypes, newTab?: boolean) => void;
}

export default SelectAlertType;
