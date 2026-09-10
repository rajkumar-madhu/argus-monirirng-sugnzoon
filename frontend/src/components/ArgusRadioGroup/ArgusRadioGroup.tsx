import { ToggleGroupSimple } from '@signozhq/ui/toggle-group';

import './ArgusRadioGroup.styles.scss';

interface Option {
	value: string;
	label: string | React.ReactNode;
	icon?: React.ReactNode;
}

interface ArgusRadioGroupProps {
	value: string;
	options: Option[];
	onChange: (value: string) => void;
	className?: string;
	disabled?: boolean;
}

function ArgusRadioGroup({
	value,
	options,
	onChange,
	className = '',
	disabled = false,
}: ArgusRadioGroupProps): JSX.Element {
	return (
		<ToggleGroupSimple
			type="single"
			value={value}
			className={`argus-radio-group ${className}`}
			onChange={onChange}
			disabled={disabled}
			items={options.map((option) => ({
				value: option.value,
				label: (
					<div className="view-title-container">
						{option.icon && <div className="icon-container">{option.icon}</div>}
						{option.label}
					</div>
				),
			}))}
		/>
	);
}

ArgusRadioGroup.defaultProps = {
	className: '',
	disabled: false,
};

export default ArgusRadioGroup;
