import { render, screen } from '@testing-library/react';

import AuthFooter from './AuthFooter';

jest.mock('utils/docLinks', () => ({
	__esModule: true,
	default: {
		PRIVACY: 'https://docs.example.test/security',
		SECURITY: 'https://docs.example.test/security',
	},
}));

describe('AuthFooter', () => {
	it('describes the installation without claiming unverified service health', () => {
		render(<AuthFooter />);
		expect(screen.getByText('Self-hosted observability')).toBeInTheDocument();
		expect(screen.queryByText('All systems operational')).not.toBeInTheDocument();
	});
	it('does not label a security policy as a separate privacy policy', () => {
		render(<AuthFooter />);
		expect(
			screen.queryByRole('link', { name: 'Privacy' }),
		).not.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute(
			'href',
			'https://docs.example.test/security',
		);
	});
});
