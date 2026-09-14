import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';

import styles from './LogHighlights.module.scss';

interface InfraResourceFieldProps {
	label: string;
	value: string;
	kind: 'host' | 'pod' | 'node';
}

function InfraResourceField({
	label,
	value,
	kind,
}: InfraResourceFieldProps): JSX.Element {
	const pathname =
		kind === 'host'
			? ROUTES.INFRASTRUCTURE_MONITORING_HOSTS
			: ROUTES.INFRASTRUCTURE_MONITORING_KUBERNETES;

	const search =
		kind === 'host'
			? `?search=${encodeURIComponent(value)}`
			: `?entity=${encodeURIComponent(kind)}&search=${encodeURIComponent(value)}`;

	return (
		<Link
			to={{ pathname, search }}
			target="_blank"
			rel="noreferrer"
			className={styles.traceLink}
			title={`${label}: ${value}`}
		>
			{value}
		</Link>
	);
}

export default InfraResourceField;
