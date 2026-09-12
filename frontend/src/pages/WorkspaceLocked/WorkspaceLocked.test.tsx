import {
	setupAuthzAdmin,
	setupAuthzDenyAll,
} from 'lib/authz/utils/authz-test-utils';
import { licensesSuccessWorkspaceLockedResponse } from 'mocks-server/__mockdata__/licenses';
import { server } from 'mocks-server/server';
import { rest } from 'msw';
import { act, render, screen, waitFor } from 'tests/test-utils';

import WorkspaceLocked from '.';

describe('WorkspaceLocked', () => {
	const apiURL = 'http://localhost/api/v2/licenses';

	it('Should render the component', async () => {
		server.use(
			rest.get(apiURL, (req, res, ctx) =>
				res(ctx.status(200), ctx.json(licensesSuccessWorkspaceLockedResponse)),
			),
		);

		act(() => {
			render(<WorkspaceLocked />);
		});

		const workspaceLocked = await screen.findByRole('heading', {
			name: 'upgradeToContinue',
		});
		expect(workspaceLocked).toBeInTheDocument();

		const reportIssue = await screen.findByTestId(
			'workspace-locked-report-issue',
		);
		expect(reportIssue).toHaveAttribute(
			'href',
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
		);
		expect(screen.queryByRole('tab', { name: /good company/i })).toBeNull();
		expect(
			screen.getByRole('tab', { name: 'whyChooseSignoz' }),
		).toBeInTheDocument();
		expect(screen.queryByText(/SOC 2|10TB|all 5 continents/i)).toBeNull();
		expect(document.querySelector('a[href*="argus.example.com"]')).toBeNull();
	});

	it('enables the upgrade action when subscription create is granted', async () => {
		server.use(
			rest.get(apiURL, (req, res, ctx) =>
				res(ctx.status(200), ctx.json(licensesSuccessWorkspaceLockedResponse)),
			),
			setupAuthzAdmin(),
		);

		render(<WorkspaceLocked />);
		const updateCreditCardBtn = await screen.findByRole('button', {
			name: /continue my journey/i,
		});
		await waitFor(() => {
			expect(updateCreditCardBtn).toBeEnabled();
		});
	});

	it('disables the upgrade action when subscription create is denied', async () => {
		server.use(
			rest.get(apiURL, (req, res, ctx) =>
				res(ctx.status(200), ctx.json(licensesSuccessWorkspaceLockedResponse)),
			),
			setupAuthzDenyAll(),
		);

		render(<WorkspaceLocked />, {}, { role: 'VIEWER' });
		const updateCreditCardBtn = await screen.findByRole('button', {
			name: /continue my journey/i,
		});
		await waitFor(() => {
			expect(updateCreditCardBtn).toBeDisabled();
		});
	});
});
