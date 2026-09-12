import { getRolePresentation } from '../rolePresentation';

describe('managed role presentation', () => {
	it.each(['admin', 'editor', 'viewer', 'anonymous'])(
		'brands the managed %s role without changing its source',
		(name) => {
			const role = {
				id: 'unchanged-id',
				name: `signoz-${name}`,
				type: 'managed',
				description: 'Argus resources',
			};
			const original = { ...role };
			const display = getRolePresentation(role);
			expect(display.name).toBe(`WeCrew ${name[0].toUpperCase()}${name.slice(1)}`);
			expect(display.description).not.toMatch(/Argus|SigNoz/i);
			expect(role).toStrictEqual(original);
		},
	);
	it('preserves custom roles even when their name matches a built-in identifier', () => {
		const role = {
			name: 'signoz-admin',
			type: 'custom',
			description: 'Customer-owned description',
		};
		expect(getRolePresentation(role)).toStrictEqual({
			name: role.name,
			description: role.description,
		});
	});
	it('preserves unknown managed roles', () => {
		expect(
			getRolePresentation({
				name: 'special-role',
				type: 'managed',
				description: 'Special access',
			}),
		).toStrictEqual({ name: 'special-role', description: 'Special access' });
	});
	it('handles missing metadata', () => {
		expect(getRolePresentation({})).toStrictEqual({ name: '', description: '' });
	});
});
