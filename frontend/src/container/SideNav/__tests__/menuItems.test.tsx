import {
	getUserSettingsDropdownMenuItems,
	helpSupportDropdownMenuItems,
} from 'container/SideNav/menuItems';

const BASE_PARAMS = {
	userEmail: 'test@argus.example.com',
	isWorkspaceBlocked: false,
	isEnterpriseSelfHostedUser: false,
	isCommunityEnterpriseUser: false,
};

describe('getUserSettingsDropdownMenuItems', () => {
	it('directs product resources to the WeCrew repository', () => {
		const repository =
			'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon';
		expect(
			helpSupportDropdownMenuItems.find((item) => item.key === 'github')?.url,
		).toBe(repository);
		expect(
			helpSupportDropdownMenuItems.find((item) => item.key === 'documentation')
				?.url,
		).toBe(
			`${repository}/blob/codex/fix-api-generation/infra/hostinger-vm/README.md`,
		);
		expect(
			helpSupportDropdownMenuItems.find((item) => item.key === 'slack')?.url,
		).toBe(`${repository}/issues`);
	});
	it('always includes logged-in-as label, workspace, account, keyboard shortcuts, and sign out', () => {
		const items = getUserSettingsDropdownMenuItems(BASE_PARAMS);
		const keys = items?.map((item) => item?.key);

		expect(keys).toContain('label');
		expect(keys).toContain('workspace');
		expect(keys).toContain('account');
		expect(keys).toContain('keyboard-shortcuts');
		expect(keys).toContain('logout');

		// workspace item is enabled when workspace is not blocked
		const workspaceItem = items?.find(
			(item: any) => item.key === 'workspace',
		) as any;

		expect(workspaceItem?.disabled).toBe(false);

		// does not include license item for regular cloud user
		expect(keys).not.toContain('license');
	});

	it('includes manage license item for enterprise self-hosted users', () => {
		const items = getUserSettingsDropdownMenuItems({
			...BASE_PARAMS,
			isEnterpriseSelfHostedUser: true,
		});
		const keys = items?.map((item) => item?.key);

		expect(keys).toContain('license');
	});

	it('includes manage license item for community enterprise users', () => {
		const items = getUserSettingsDropdownMenuItems({
			...BASE_PARAMS,
			isCommunityEnterpriseUser: true,
		});
		const keys = items?.map((item) => item?.key);

		expect(keys).toContain('license');
	});

	it('workspace item is disabled when workspace is blocked', () => {
		const items = getUserSettingsDropdownMenuItems({
			...BASE_PARAMS,
			isWorkspaceBlocked: true,
		});
		const workspaceItem = items?.find(
			(item: any) => item.key === 'workspace',
		) as any;

		expect(workspaceItem?.disabled).toBe(true);
	});

	it('returns items in correct order: label, divider, workspace, account, ..., shortcuts, divider, logout', () => {
		const items = getUserSettingsDropdownMenuItems(BASE_PARAMS) ?? [];
		const keys = items.map((item: any) => item.key ?? item.type);

		expect(keys[0]).toBe('label');
		expect(keys[1]).toBe('divider');
		expect(keys[2]).toBe('workspace');
		expect(keys[3]).toBe('account');
		expect(keys[keys.length - 1]).toBe('logout');
	});
});
