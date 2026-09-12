import userEvent from '@testing-library/user-event';
import { render, screen } from 'tests/test-utils';
import ROUTES from 'constants/routes';
import { withBasePath } from 'utils/basePath';
import SignalExplorer from '../SignalExplorer';

describe('SignalExplorer', () => {
	it('starts with an accessible illustrative trace view and workspace destination', () => {
		render(<SignalExplorer />);
		expect(screen.getByTestId('signal-tab-Traces')).toHaveAccessibleName(
			'Traces',
		);
		expect(screen.getByTestId('signal-tab-Traces')).toHaveAttribute(
			'aria-selected',
			'true',
		);
		expect(screen.getByTestId('signal-tab-Metrics')).toHaveAttribute(
			'tabindex',
			'-1',
		);
		expect(screen.getByTestId('signal-panel')).toHaveAccessibleName('Traces');
		expect(
			screen.getByText('Follow a request across services.'),
		).toBeInTheDocument();
		expect(
			screen.getByText('Illustrative example · not live telemetry'),
		).toBeInTheDocument();
		expect(screen.getByTestId('signal-workspace')).toHaveAttribute(
			'href',
			withBasePath(ROUTES.HOME),
		);
	});

	it('switches meaningful content when each tab is clicked', async () => {
		const user = userEvent.setup();
		render(<SignalExplorer />);
		await user.click(screen.getByTestId('signal-tab-Metrics'));
		expect(screen.getByTestId('signal-panel')).toHaveAccessibleName('Metrics');
		expect(
			screen.getByText(
				/Request duration rises, peaks, then returns toward its baseline/,
			),
		).toBeInTheDocument();
		expect(
			screen.getByText('See patterns. Understand change.'),
		).toBeInTheDocument();
		expect(
			screen.queryByText('Follow a request across services.'),
		).not.toBeInTheDocument();
		await user.click(screen.getByTestId('signal-tab-Logs'));
		expect(screen.getByTestId('signal-panel')).toHaveAccessibleName('Logs');
		expect(screen.getByText('Put every event in context.')).toBeInTheDocument();
		expect(
			screen.getByText('Illustrative example · not live telemetry'),
		).toBeInTheDocument();
	});

	it('moves focus and selection with arrow, Home, and End keys', async () => {
		const user = userEvent.setup();
		render(<SignalExplorer />);
		screen.getByTestId('signal-tab-Traces').focus();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByTestId('signal-tab-Metrics')).toHaveFocus();
		expect(screen.getByTestId('signal-tab-Metrics')).toHaveAttribute(
			'aria-selected',
			'true',
		);
		await user.keyboard('{End}');
		expect(screen.getByTestId('signal-tab-Logs')).toHaveFocus();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByTestId('signal-tab-Traces')).toHaveFocus();
		await user.keyboard('{ArrowLeft}');
		expect(screen.getByTestId('signal-tab-Logs')).toHaveFocus();
		await user.keyboard('{Home}');
		expect(screen.getByTestId('signal-tab-Traces')).toHaveFocus();
		expect(screen.getByTestId('signal-tab-Logs')).toHaveAttribute(
			'tabindex',
			'-1',
		);
	});
});
