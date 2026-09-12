import ROUTES from 'constants/routes';
import history from 'lib/history';
import { render, screen, userEvent } from 'tests/test-utils';

import AlertRules from './AlertRules';

jest.mock('api/common/logEvent', () => ({
	__esModule: true,
	default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('api/generated/services/rules', () => {
	const response = {
		data: {
			data: [
				{
					id: 'rule-one',
					alert: 'Request errors',
					state: 'firing',
					labels: { severity: 'critical' },
					condition: { compositeQuery: { panelType: 'graph' } },
				},
			],
		},
		isLoading: false,
		isError: false,
	};
	return { useListRules: () => response };
});
jest.mock('types/api/alerts/convert', () => ({
	toCompositeMetricQuery: jest.fn().mockReturnValue({}),
}));
jest.mock(
	'lib/newQueryBuilder/queryBuilderMappers/mapQueryDataFromApi',
	() => ({
		mapQueryDataFromApi: jest.fn().mockReturnValue({ builder: {} }),
	}),
);

describe('Home alert row activation', () => {
	const pushSpy = jest
		.spyOn(history, 'push')
		.mockImplementation(() => undefined);

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it.each(['pointer', 'Enter', 'Space'])(
		'navigates exactly once with %s',
		async (mode) => {
			const user = userEvent.setup();
			render(
				<AlertRules onUpdateChecklistDoneItem={jest.fn()} loadingUserPreferences />,
			);
			const row = await screen.findByTestId('home-alert-rule');
			expect(row.tagName).toBe('BUTTON');
			if (mode === 'pointer') {
				await user.click(row);
			} else {
				row.focus();
				await user.keyboard(mode === 'Enter' ? '{Enter}' : ' ');
			}
			expect(pushSpy).toHaveBeenCalledTimes(1);
			expect(pushSpy).toHaveBeenCalledWith(
				expect.stringContaining(ROUTES.ALERT_OVERVIEW),
			);
			expect(pushSpy).toHaveBeenCalledWith(expect.stringContaining('rule-one'));
		},
	);
});
