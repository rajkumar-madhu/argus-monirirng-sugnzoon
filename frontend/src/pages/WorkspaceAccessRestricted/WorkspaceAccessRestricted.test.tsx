import { render, screen } from '@testing-library/react';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import { useAppContext } from 'providers/App/App';
import { LicensePlatform, LicenseState } from 'types/api/licensesV3/getActive';

import WorkspaceAccessRestricted from './WorkspaceAccessRestricted';

jest.mock('providers/App/App', () => ({ useAppContext: jest.fn() }));
jest.mock('lib/history', () => ({
	__esModule: true,
	default: { push: jest.fn() },
}));

const pushSpy = jest.spyOn(history, 'push');

describe('WorkspaceAccessRestricted', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it.each([
		LicenseState.TERMINATED,
		LicenseState.EXPIRED,
		LicenseState.CANCELLED,
	])(
		'keeps %s cloud licenses restricted with administrator guidance',
		(state) => {
			jest.mocked(useAppContext).mockReturnValue({
				activeLicense: { state, platform: LicensePlatform.CLOUD },
				isFetchingActiveLicense: false,
			} as ReturnType<typeof useAppContext>);
			render(<WorkspaceAccessRestricted />);
			expect(pushSpy).not.toHaveBeenCalled();
			expect(
				screen.getByText(new RegExp(`Your WeCrew license is ${state}`)),
			).toBeInTheDocument();
			expect(screen.getByTestId('restricted-report-issue')).toHaveAttribute(
				'href',
				'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
			);
			expect(document.querySelector('a[href*="argus.example.com"]')).toBeNull();
		},
	);

	it.each([
		[LicenseState.ACTIVATED, LicensePlatform.CLOUD],
		[LicenseState.TERMINATED, LicensePlatform.SELF_HOSTED],
		[LicenseState.EXPIRED, LicensePlatform.SELF_HOSTED],
		[LicenseState.CANCELLED, LicensePlatform.SELF_HOSTED],
	])('preserves home redirect for %s on %s', (state, platform) => {
		jest.mocked(useAppContext).mockReturnValue({
			activeLicense: { state, platform },
			isFetchingActiveLicense: false,
		} as ReturnType<typeof useAppContext>);
		render(<WorkspaceAccessRestricted />);
		expect(pushSpy).toHaveBeenCalledWith(ROUTES.HOME);
	});

	it('does not redirect before the license finishes loading', () => {
		jest.mocked(useAppContext).mockReturnValue({
			activeLicense: undefined,
			isFetchingActiveLicense: true,
		} as unknown as ReturnType<typeof useAppContext>);
		render(<WorkspaceAccessRestricted />);
		expect(pushSpy).not.toHaveBeenCalled();
	});
});
