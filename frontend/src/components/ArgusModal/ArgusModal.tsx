import { Modal, ModalProps } from 'antd';

import './ArgusModal.style.scss';

function ArgusModal({
	children,
	width = 672,
	rootClassName = '',
	...rest
}: ModalProps): JSX.Element {
	return (
		<Modal
			centered
			width={width}
			cancelText="Close"
			rootClassName={`argus-modal ${rootClassName}`}
			{...rest}
		>
			{children}
		</Modal>
	);
}

export default ArgusModal;
