import { render, screen } from 'tests/test-utils';
import ROUTES from 'constants/routes';
import { withBasePath } from 'utils/basePath';

import LandingCapabilities from '../LandingCapabilities';

describe('LandingCapabilities', () => {
	it('describes WeCrew capabilities and links into the workspace', () => {
		render(<LandingCapabilities />);

		expect(screen.getByTestId('landing-capabilities')).toBeInTheDocument();
		expect(screen.getByText('Follow every request')).toBeInTheDocument();
		expect(screen.getByText('Understand change')).toBeInTheDocument();
		expect(screen.getByText('Keep your data close')).toBeInTheDocument();
		expect(screen.getByTestId('capabilities-open-workspace')).toHaveAttribute(
			'href',
			withBasePath(ROUTES.HOME),
		);
	});
});
