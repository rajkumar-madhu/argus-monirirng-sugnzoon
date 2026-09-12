import ROUTES from 'constants/routes';
import { render, screen, userEvent } from 'tests/test-utils';
import { openInNewTab } from 'utils/navigation';

import Dashboards from './Dashboards';

const mockNavigate = jest.fn();

jest.mock('api/common/logEvent', () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('hooks/useSafeNavigate', () => ({
	useSafeNavigate: () => ({ safeNavigate: mockNavigate }),
}));
jest.mock('utils/navigation', () => ({ openInNewTab: jest.fn() }));
jest.mock('api/generated/services/dashboard', () => {
	const response = {
		data: {
			data: {
				dashboards: [{ id: 'dashboard-one', name: 'Service health', tags: [] }],
			},
		},
		isLoading: false,
		isError: false,
	};
	return { useListDashboardsForUserV2: () => response };
});

describe('Home dashboard row activation', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it.each(['pointer', 'Enter', 'Space'])(
		'navigates exactly once with %s',
		async (mode) => {
			const user = userEvent.setup();
			render(
				<Dashboards onUpdateChecklistDoneItem={jest.fn()} loadingUserPreferences />,
			);
			const row = await screen.findByTestId('home-dashboard');
			expect(row.tagName).toBe('BUTTON');
			if (mode === 'pointer') {
				await user.click(row);
			} else {
				row.focus();
				await user.keyboard(mode === 'Enter' ? '{Enter}' : ' ');
			}
			expect(mockNavigate).toHaveBeenCalledTimes(1);
			expect(mockNavigate).toHaveBeenCalledWith(
				`${ROUTES.ALL_DASHBOARD}/dashboard-one`,
			);
			expect(openInNewTab).not.toHaveBeenCalled();
		},
	);

	it.each(['Control', 'Meta'])(
		'opens exactly one new tab with %s click',
		async (modifier) => {
			const user = userEvent.setup();
			render(
				<Dashboards onUpdateChecklistDoneItem={jest.fn()} loadingUserPreferences />,
			);
			const row = await screen.findByTestId('home-dashboard');
			await user.keyboard(`{${modifier}>}`);
			await user.click(row);
			await user.keyboard(`{/${modifier}}`);
			expect(openInNewTab).toHaveBeenCalledTimes(1);
			expect(openInNewTab).toHaveBeenCalledWith(
				`${ROUTES.ALL_DASHBOARD}/dashboard-one`,
			);
			expect(mockNavigate).not.toHaveBeenCalled();
		},
	);
});
