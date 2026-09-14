import { generatePath, Link } from 'react-router-dom';
import ROUTES from 'constants/routes';

import styles from './LogHighlights.module.scss';

interface ServiceNameFieldProps {
	serviceName: string;
}

function ServiceNameField({ serviceName }: ServiceNameFieldProps): JSX.Element {
	return (
		<Link
			to={generatePath(ROUTES.SERVICE_METRICS, {
				servicename: encodeURIComponent(serviceName),
			})}
			target="_blank"
			rel="noreferrer"
			className={styles.traceLink}
			title={serviceName}
		>
			<span className={styles.serviceDot} />
			{serviceName}
		</Link>
	);
}

export default ServiceNameField;
