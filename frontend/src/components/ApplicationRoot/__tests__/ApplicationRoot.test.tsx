import { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import history from 'lib/history';
import ApplicationRoot from '../ApplicationRoot';

jest.mock('pages/Landing/LandingPage', () => ({
	__esModule: true,
	default: () => <main data-testid="landing" />,
}));
jest.mock('AppRoutes', () => ({
	__esModule: true,
	default: () => <main data-testid="workspace-routes" />,
}));
jest.mock('providers/App/App', () => ({
	AppProvider: ({ children }: { children: ReactNode }) => (
		<div data-testid="app-provider">{children}</div>
	),
}));

describe('public landing route boundary', () => {
	beforeEach(() => history.replace('/'));
	it('renders the root without mounting the application provider', () => {
		render(<ApplicationRoot />);
		expect(screen.getByTestId('landing')).toBeInTheDocument();
		expect(screen.queryByTestId('app-provider')).not.toBeInTheDocument();
	});
	it.each([
		'/home',
		'/login',
		'/settings/roles',
		'/public/dashboard/example',
		'/signup',
	])('preserves the application flow at %s', (path) => {
		history.replace(path);
		render(<ApplicationRoot />);
		expect(screen.getByTestId('app-provider')).toBeInTheDocument();
		expect(screen.getByTestId('workspace-routes')).toBeInTheDocument();
	});
	it('responds to history changes and ignores root query and hash values', () => {
		render(<ApplicationRoot />);
		act(() => history.push('/home'));
		expect(screen.getByTestId('workspace-routes')).toBeInTheDocument();
		act(() => history.push('/?source=preview#platform'));
		expect(screen.getByTestId('landing')).toBeInTheDocument();
		expect(screen.queryByTestId('app-provider')).not.toBeInTheDocument();
	});
});
