import { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';
import { Pagination, Skeleton } from 'antd';
import { useListRoles } from 'api/generated/services/role';
import { AuthtypesGettableRoleDTO } from 'api/generated/services/sigNoz.schemas';
import ErrorInPlace from 'components/ErrorInPlace/ErrorInPlace';
import ROUTES from 'constants/routes';
import { useRolesFeatureGate } from 'hooks/useRolesFeatureGate';
import useUrlQuery from 'hooks/useUrlQuery';
import { withAuthZContent } from 'lib/authz/components/withAuthZ/withAuthZContent';
import { RoleListPermission } from 'lib/authz/hooks/useAuthZ/permissions/role.permissions';
import LineClampedText from 'periscope/components/LineClampedText/LineClampedText';
import { useTimezone } from 'providers/Timezone';
import { RoleType } from 'types/roles';
import { withBasePath } from 'utils/basePath';
import { toAPIError } from 'utils/errorUtils';
import { getRolePresentation } from 'utils/rolePresentation';

import styles from './RolesListingTable.module.scss';

const PAGE_SIZE = 20;

type DisplayItem =
	| { type: 'section'; label: string; count?: number }
	| { type: 'role'; role: AuthtypesGettableRoleDTO };

interface RolesListContentProps {
	searchQuery: string;
}

function RolesListContent({ searchQuery }: RolesListContentProps): JSX.Element {
	const { isRolesEnabled } = useRolesFeatureGate();

	const { data, isLoading, isError, error } = useListRoles();
	const { formatTimezoneAdjustedTimestampOptional } = useTimezone();
	const history = useHistory();
	const urlQuery = useUrlQuery();
	const pageParam = parseInt(urlQuery.get('page') ?? '1', 10);
	const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

	const setCurrentPage = useCallback(
		(page: number): void => {
			urlQuery.set('page', String(page));
			history.replace({ search: urlQuery.toString() });
		},
		[history, urlQuery],
	);

	const roles = useMemo(() => data?.data ?? [], [data]);

	const filteredRoles = useMemo(() => {
		if (!searchQuery.trim()) {
			return roles;
		}
		const query = searchQuery.toLowerCase();
		return roles.filter(
			(role) =>
				getRolePresentation(role).name.toLowerCase().includes(query) ||
				getRolePresentation(role).description.toLowerCase().includes(query),
		);
	}, [roles, searchQuery]);

	const managedRoles = useMemo(
		() =>
			filteredRoles.filter(
				(role) => role.type?.toLowerCase() === RoleType.MANAGED,
			),
		[filteredRoles],
	);
	const customRoles = useMemo(
		() =>
			filteredRoles.filter((role) => role.type?.toLowerCase() === RoleType.CUSTOM),
		[filteredRoles],
	);

	const displayList = useMemo((): DisplayItem[] => {
		const result: DisplayItem[] = [];

		if (managedRoles.length > 0) {
			result.push({ type: 'section', label: 'Managed roles' });
			managedRoles.forEach((role) => result.push({ type: 'role', role }));
		}
		if (customRoles.length > 0) {
			result.push({
				type: 'section',
				label: 'Custom roles',
				count: customRoles.length,
			});
			customRoles.forEach((role) => result.push({ type: 'role', role }));
		}
		return result;
	}, [managedRoles, customRoles]);

	const totalRoleCount = managedRoles.length + customRoles.length;

	useEffect(() => {
		if (isLoading || totalRoleCount === 0) {
			return;
		}
		const maxPage = Math.ceil(totalRoleCount / PAGE_SIZE);
		if (currentPage > maxPage) {
			setCurrentPage(maxPage);
		}
	}, [isLoading, totalRoleCount, currentPage, setCurrentPage]);

	const paginatedItems = useMemo((): DisplayItem[] => {
		const startRole = (currentPage - 1) * PAGE_SIZE;
		const endRole = startRole + PAGE_SIZE;
		let roleIndex = 0;
		let lastSection: DisplayItem | null = null;
		const result: DisplayItem[] = [];

		for (const item of displayList) {
			if (item.type === 'section') {
				lastSection = item;
			} else {
				if (roleIndex >= startRole && roleIndex < endRole) {
					if (lastSection) {
						result.push(lastSection);
						lastSection = null;
					}
					result.push(item);
				}
				roleIndex++;
			}
		}
		return result;
	}, [displayList, currentPage]);

	const handleRowClick = useCallback(
		(roleId: string, roleName: string): void => {
			if (isRolesEnabled) {
				const url = `${ROUTES.ROLE_DETAILS.replace(':roleId', roleId)}?name=${encodeURIComponent(roleName)}`;
				history.push(url);
			}
		},
		[isRolesEnabled, history],
	);

	const showPaginationItem = (total: number, range: number[]): JSX.Element => (
		<>
			<span className="numbers">
				{range[0]} &#8212; {range[1]}
			</span>
			<span className="total"> of {total}</span>
		</>
	);

	if (isLoading) {
		return (
			<div className={styles.rolesListingTable}>
				<Skeleton active paragraph={{ rows: 5 }} />
			</div>
		);
	}

	if (isError) {
		return (
			<div className={styles.rolesListingTable}>
				<ErrorInPlace
					error={toAPIError(
						error,
						'An unexpected error occurred while fetching roles.',
					)}
				/>
			</div>
		);
	}

	if (filteredRoles.length === 0) {
		return (
			<div className={styles.rolesListingTable}>
				<div className={styles.emptyState}>
					{searchQuery ? 'No roles match your search.' : 'No roles found.'}
				</div>
			</div>
		);
	}

	const renderRow = (role: AuthtypesGettableRoleDTO): JSX.Element => {
		const cells = (
			<>
				<div className={cx(styles.tableCell, styles.tableCellName)}>
					{getRolePresentation(role).name || '—'}
				</div>
				<div className={cx(styles.tableCell, styles.tableCellDescription)}>
					<LineClampedText
						text={getRolePresentation(role).description || '—'}
						tooltipProps={{ overlayClassName: styles.descriptionTooltip }}
					/>
				</div>
				<div className={cx(styles.tableCell, styles.tableCellUpdatedAt)}>
					{formatTimezoneAdjustedTimestampOptional(role.updatedAt)}
				</div>
				<div className={cx(styles.tableCell, styles.tableCellCreatedAt)}>
					{formatTimezoneAdjustedTimestampOptional(role.createdAt)}
				</div>
			</>
		);

		if (!isRolesEnabled || !role.id || !role.name) {
			return (
				<div key={role.id} className={styles.tableRow}>
					{cells}
				</div>
			);
		}

		return (
			<a
				key={role.id}
				className={cx(styles.tableRow, styles.tableRowClickable)}
				href={withBasePath(
					`${ROUTES.ROLE_DETAILS.replace(':roleId', role.id)}?name=${encodeURIComponent(role.name)}`,
				)}
				style={{ textDecoration: 'none' }}
				data-testid={`role-row-${role.id}`}
				onClick={(event): void => {
					if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
						return;
					}
					event.preventDefault();
					if (role.id && role.name) {
						handleRowClick(role.id, role.name);
					}
				}}
			>
				{cells}
			</a>
		);
	};

	return (
		<div className={styles.rolesListingTable}>
			<div className={styles.scrollContainer}>
				<div className={styles.tableInner}>
					<div className={styles.tableHeader}>
						<div className={cx(styles.headerCell, styles.headerCellName)}>Name</div>
						<div className={cx(styles.headerCell, styles.headerCellDescription)}>
							Description
						</div>
						<div className={cx(styles.headerCell, styles.headerCellUpdatedAt)}>
							Updated At
						</div>
						<div className={cx(styles.headerCell, styles.headerCellCreatedAt)}>
							Created At
						</div>
					</div>

					{paginatedItems.map((item) =>
						item.type === 'section' ? (
							<h3 key={`section-${item.label}`} className={styles.sectionHeader}>
								{item.label}
								{item.count !== undefined && (
									<span className={styles.sectionHeaderCount}>{item.count}</span>
								)}
							</h3>
						) : (
							renderRow(item.role)
						),
					)}
				</div>
			</div>

			<Pagination
				current={currentPage}
				pageSize={PAGE_SIZE}
				total={totalRoleCount}
				showTotal={showPaginationItem}
				showSizeChanger={false}
				hideOnSinglePage
				onChange={(page): void => setCurrentPage(page)}
				className={styles.pagination}
			/>
		</div>
	);
}

export default withAuthZContent<RolesListContentProps>(RolesListContent, {
	checks: [RoleListPermission],
	fallbackOnLoading: (
		<div className={styles.rolesListingTable}>
			<Skeleton active paragraph={{ rows: 5 }} />
		</div>
	),
});
