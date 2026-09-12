import { Input } from '@signozhq/ui/input';
import { Form } from 'antd';
import { CloudintegrationtypesCredentialsDTO } from 'api/generated/services/sigNoz.schemas';

function RenderConnectionFields({
	isConnectionParamsLoading,
	connectionParams,
	isFormDisabled,
}: {
	isConnectionParamsLoading?: boolean;
	connectionParams?: CloudintegrationtypesCredentialsDTO | null;
	isFormDisabled?: boolean;
}): JSX.Element | null {
	if (
		isConnectionParamsLoading ||
		(!!connectionParams?.ingestionUrl &&
			!!connectionParams?.ingestionKey &&
			!!connectionParams?.sigNozApiUrl &&
			!!connectionParams?.sigNozApiKey)
	) {
		return null;
	}

	return (
		<Form.Item name="connectionParams">
			{!connectionParams?.ingestionUrl && (
				<Form.Item
					name="ingestionUrl"
					label="Ingestion URL"
					rules={[{ required: true, message: 'Please enter ingestion URL' }]}
				>
					<Input placeholder="Enter ingestion URL" disabled={isFormDisabled} />
				</Form.Item>
			)}
			{!connectionParams?.ingestionKey && (
				<Form.Item
					name="ingestionKey"
					label="Ingestion Key"
					rules={[{ required: true, message: 'Please enter ingestion key' }]}
				>
					<Input placeholder="Enter ingestion key" disabled={isFormDisabled} />
				</Form.Item>
			)}
			{!connectionParams?.sigNozApiUrl && (
				<Form.Item
					name="sigNozApiUrl"
					label="WeCrew API URL"
					rules={[{ required: true, message: 'Please enter WeCrew API URL' }]}
				>
					<Input
						placeholder="https://monitoring.wecrew.in"
						disabled={isFormDisabled}
					/>
				</Form.Item>
			)}
			{!connectionParams?.sigNozApiKey && (
				<Form.Item
					name="sigNozApiKey"
					label="WeCrew API Key"
					rules={[{ required: true, message: 'Please enter WeCrew API Key' }]}
				>
					<Input placeholder="Enter WeCrew API key" disabled={isFormDisabled} />
				</Form.Item>
			)}
		</Form.Item>
	);
}

RenderConnectionFields.defaultProps = {
	connectionParams: null,
	isFormDisabled: false,
	isConnectionParamsLoading: false,
};

export default RenderConnectionFields;
