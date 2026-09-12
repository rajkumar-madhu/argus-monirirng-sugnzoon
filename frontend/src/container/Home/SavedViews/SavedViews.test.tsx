import ROUTES from 'constants/routes';
import { render, screen, userEvent } from 'tests/test-utils';

import SavedViews from './SavedViews';

const mockExplorerChange = jest.fn();

jest.mock('api/common/logEvent', () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('hooks/useHandleExplorerTabChange', () => ({
	useHandleExplorerTabChange: () => ({
		handleExplorerTabChange: mockExplorerChange,
	}),
}));
jest.mock('hooks/saveViews/useGetAllViews', () => {
	const response = {
		data: {
			data: { data: [{ id: 'view-one', name: 'Application errors', tags: [] }] },
		},
		isLoading: false,
		isError: false,
	};
	return { useGetAllViews: () => response };
});
jest.mock('components/ExplorerCard/utils', () => ({
	getViewDetailsUsingViewKey: () => ({
		query: {},
		name: 'Application errors',
		id: 'view-one',
		panelType: 'list',
	}),
}));

describe('Home saved-view row activation', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it.each(['pointer', 'Enter', 'Space', 'icon'])(
		'navigates exactly once with %s',
		async (mode) => {
			const user = userEvent.setup();
			render(
				<SavedViews onUpdateChecklistDoneItem={jest.fn()} loadingUserPreferences />,
			);
			const row = await screen.findByTestId('home-saved-view');
			expect(row.tagName).toBe('BUTTON');
			expect(row.querySelector('button')).toBeNull();
			const icon = row.querySelector('[aria-hidden="true"]');
			expect(icon).not.toBeNull();
			if (!icon) {
				throw new Error('Saved-view row must include its decorative icon');
			}
			if (mode === 'pointer') {
				await user.click(row);
			} else if (mode === 'icon') {
				await user.click(icon);
			} else {
				row.focus();
				await user.keyboard(mode === 'Enter' ? '{Enter}' : ' ');
			}
			expect(mockExplorerChange).toHaveBeenCalledTimes(1);
			expect(mockExplorerChange).toHaveBeenCalledWith(
				'list',
				{ query: {}, viewName: 'Application errors', viewKey: 'view-one' },
				ROUTES.LOGS_EXPLORER,
			);
		},
	);
});
