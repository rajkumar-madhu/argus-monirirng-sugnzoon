import { Dispatch, SetStateAction } from 'react';
import { FormInstance } from 'antd';
import { GatewaytypesIngestionKeyDTO } from 'api/generated/services/sigNoz.schemas';
import { LimitProps } from 'types/api/ingestionKeys/limits/types';
import { Button } from '@signozhq/ui/button';
import { Color } from '@signozhq/design-tokens';
import { PenLine, Trash2, Plus } from '@signozhq/icons';
import SignalLimitEditor from './SignalLimitEditor';
import SignalLimitView from './SignalLimitView';
export interface SignalLimitItemProps {
	APIKey: GatewaytypesIngestionKeyDTO;
	signalCfg: { name: string; usesSize: boolean; usesCount: boolean };
	limit: LimitProps;
	activeAPIKey: GatewaytypesIngestionKeyDTO | null;
	activeSignal: LimitProps | null;
	isEditAddLimitOpen: boolean;
	addEditLimitForm: FormInstance;
	setActiveSignal: Dispatch<SetStateAction<LimitProps | null>>;
	isLoadingLimitForKey: boolean;
	isLoadingUpdatedLimitForKey: boolean;
	hasCreateLimitForIngestionKeyError: boolean;
	hasUpdateLimitForIngestionKeyError: boolean;
	createLimitForIngestionKeyError: string | null;
	updateLimitForIngestionKeyError: string | null;
	hasLimits: (name: string) => boolean;
	enableEditLimitMode: (
		key: GatewaytypesIngestionKeyDTO,
		limit: LimitProps,
	) => void;
	showDeleteLimitModal: (
		key: GatewaytypesIngestionKeyDTO,
		limit: LimitProps,
	) => void;
	handleAddLimit: (key: GatewaytypesIngestionKeyDTO, name: string) => void;
	handleUpdateLimit: (
		key: GatewaytypesIngestionKeyDTO,
		limit: LimitProps,
	) => void;
	handleCreateAlert: (
		key: GatewaytypesIngestionKeyDTO,
		limit: LimitProps,
	) => void;
	handleDiscardSaveLimit: () => void;
	bytesToGb: (size: number | undefined) => number;
	countToUnit: (count: number) => { value: number; unit: string };
}
export default function SignalLimitItem(
	props: SignalLimitItemProps,
): JSX.Element {
	const {
		APIKey,
		signalCfg,
		limit,
		activeAPIKey,
		activeSignal,
		isEditAddLimitOpen,
		hasLimits,
		enableEditLimitMode,
		showDeleteLimitModal,
		handleAddLimit,
		handleUpdateLimit,
		handleCreateAlert,
		countToUnit,
	} = props;
	const signalName = signalCfg.name;

	const onEditSignalLimit = (e: React.MouseEvent): void => {
		e.stopPropagation();
		e.preventDefault();
		enableEditLimitMode(APIKey, limit);
	};

	const onDeleteSignalLimit = (e: React.MouseEvent): void => {
		e.stopPropagation();
		e.preventDefault();
		showDeleteLimitModal(APIKey, limit);
	};

	const onAddSignalLimit = (e: React.MouseEvent): void => {
		e.stopPropagation();
		e.preventDefault();
		enableEditLimitMode(APIKey, {
			id: signalName,
			signal: signalName,
			config: {},
		});
	};

	const onSaveSignalLimit = (): void => {
		if (!hasLimits(signalName)) {
			handleAddLimit(APIKey, signalName);
		} else {
			handleUpdateLimit(APIKey, limit);
		}
	};

	const onCreateSignalAlert = (): void => handleCreateAlert(APIKey, limit);

	return (
		<div className="signal" key={signalName}>
			<div className="header">
				<div className="signal-name">{signalName}</div>
				<div className="actions">
					{hasLimits(signalName) ? (
						<>
							<Button
								variant="link"
								size="icon"
								color="secondary"
								prefix={<PenLine size={14} />}
								aria-label={`Edit ${signalName} limit`}
								disabled={!!(activeAPIKey?.id === APIKey?.id && activeSignal)}
								onClick={onEditSignalLimit}
							/>
							<Button
								variant="link"
								size="icon"
								color="destructive"
								prefix={<Trash2 color={Color.BG_CHERRY_500} size={14} />}
								aria-label={`Delete ${signalName} limit`}
								disabled={!!(activeAPIKey?.id === APIKey?.id && activeSignal)}
								onClick={onDeleteSignalLimit}
							/>
						</>
					) : (
						<Button
							variant="outlined"
							size="sm"
							color="secondary"
							prefix={<Plus size={12} />}
							disabled={!!(activeAPIKey?.id === APIKey?.id && activeSignal)}
							onClick={onAddSignalLimit}
						>
							Limits
						</Button>
					)}
				</div>
			</div>

			<div className="signal-limit-values">
				{activeAPIKey?.id === APIKey?.id &&
				activeSignal?.signal === signalName &&
				isEditAddLimitOpen ? (
					<SignalLimitEditor {...props} onSaveSignalLimit={onSaveSignalLimit} />
				) : (
					<SignalLimitView
						signalCfg={signalCfg}
						limit={limit}
						countToUnit={countToUnit}
						onCreateSignalAlert={onCreateSignalAlert}
					/>
				)}
			</div>
		</div>
	);
}
