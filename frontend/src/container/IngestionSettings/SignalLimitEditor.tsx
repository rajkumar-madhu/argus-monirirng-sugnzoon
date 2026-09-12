import { Form } from 'antd';
import { Button } from '@signozhq/ui/button';
import type { SignalLimitItemProps } from './SignalLimitItem';
import SignalLimitPeriodEditor from './SignalLimitPeriodEditor';
type Props = Pick<
	SignalLimitItemProps,
	| 'signalCfg'
	| 'limit'
	| 'activeSignal'
	| 'isEditAddLimitOpen'
	| 'addEditLimitForm'
	| 'setActiveSignal'
	| 'isLoadingLimitForKey'
	| 'isLoadingUpdatedLimitForKey'
	| 'hasCreateLimitForIngestionKeyError'
	| 'hasUpdateLimitForIngestionKeyError'
	| 'createLimitForIngestionKeyError'
	| 'updateLimitForIngestionKeyError'
	| 'handleDiscardSaveLimit'
	| 'bytesToGb'
> & { onSaveSignalLimit: () => void };
export default function SignalLimitEditor({
	signalCfg,
	limit,
	activeSignal,
	isEditAddLimitOpen,
	addEditLimitForm,
	setActiveSignal,
	isLoadingLimitForKey,
	isLoadingUpdatedLimitForKey,
	hasCreateLimitForIngestionKeyError,
	hasUpdateLimitForIngestionKeyError,
	createLimitForIngestionKeyError,
	updateLimitForIngestionKeyError,
	handleDiscardSaveLimit,
	bytesToGb,
	onSaveSignalLimit,
}: Props): JSX.Element {
	return (
		<Form
			name="edit-ingestion-key-limit-form"
			key="addEditLimitForm"
			form={addEditLimitForm}
			autoComplete="off"
			initialValues={{
				dailyLimit: bytesToGb(limit?.config?.day?.size || 0),
				secondsLimit: bytesToGb(limit?.config?.second?.size || 0),
			}}
			className="edit-ingestion-key-limit-form"
		>
			<div className="signal-limit-edit-mode">
				<SignalLimitPeriodEditor
					period="day"
					signalCfg={signalCfg}
					activeSignal={activeSignal}
					setActiveSignal={setActiveSignal}
				/>
				<SignalLimitPeriodEditor
					period="second"
					signalCfg={signalCfg}
					activeSignal={activeSignal}
					setActiveSignal={setActiveSignal}
				/>
			</div>

			{!isLoadingLimitForKey &&
				hasCreateLimitForIngestionKeyError &&
				createLimitForIngestionKeyError && (
					<div className="error">{createLimitForIngestionKeyError}</div>
				)}

			{!isLoadingLimitForKey &&
				hasUpdateLimitForIngestionKeyError &&
				updateLimitForIngestionKeyError && (
					<div className="error">{updateLimitForIngestionKeyError}</div>
				)}

			{isEditAddLimitOpen && (
				<div className="signal-limit-save-discard">
					<div className="signal-limit-save-discard-actions">
						<Button
							variant="solid"
							size="sm"
							disabled={isLoadingLimitForKey || isLoadingUpdatedLimitForKey}
							loading={isLoadingLimitForKey || isLoadingUpdatedLimitForKey}
							onClick={onSaveSignalLimit}
						>
							Save
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							size="sm"
							disabled={isLoadingLimitForKey || isLoadingUpdatedLimitForKey}
							onClick={handleDiscardSaveLimit}
						>
							Discard
						</Button>
						<span className="signal-limit-alert-helper">
							You can set up an alert after saving
						</span>
					</div>
				</div>
			)}
		</Form>
	);
}
