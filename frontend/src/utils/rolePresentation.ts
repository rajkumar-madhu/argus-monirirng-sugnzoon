import type { AuthtypesGettableRoleDTO } from 'api/generated/services/sigNoz.schemas';

interface RolePresentation {
	name: string;
	description: string;
}

const MANAGED_ROLE_PRESENTATION: Readonly<Record<string, RolePresentation>> = {
	'signoz-admin': {
		name: 'WeCrew Admin',
		description:
			'Role assigned to users who have full administrative access to WeCrew resources.',
	},
	'signoz-editor': {
		name: 'WeCrew Editor',
		description:
			'Role assigned to users who can create, edit, and manage WeCrew resources but do not have full administrative privileges.',
	},
	'signoz-viewer': {
		name: 'WeCrew Viewer',
		description:
			'Role assigned to users who have read-only access to WeCrew resources.',
	},
	'signoz-anonymous': {
		name: 'WeCrew Anonymous',
		description:
			'Role assigned to anonymous users for access to public resources.',
	},
};

// Presentation only: role identifiers and API payloads must remain unchanged.
export function getRolePresentation(
	role: Partial<Pick<AuthtypesGettableRoleDTO, 'name' | 'type' | 'description'>>,
): RolePresentation {
	if (
		role.type?.toLowerCase() === 'managed' &&
		role.name &&
		Object.prototype.hasOwnProperty.call(MANAGED_ROLE_PRESENTATION, role.name)
	) {
		return { ...MANAGED_ROLE_PRESENTATION[role.name] };
	}
	return { name: role.name ?? '', description: role.description ?? '' };
}
