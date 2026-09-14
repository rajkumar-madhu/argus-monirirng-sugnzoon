import { Tooltip } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import cx from 'classnames';
import { Pin, PinOff } from '@signozhq/icons';

import { SidebarItem } from '../sideNav.types';

import './NavItem.styles.scss';

export default function NavItem({
	item,
	isActive,
	onClick,
	isDisabled,
	onTogglePin,
	isPinned,
	showIcon,
	dataTestId,
}: {
	item: SidebarItem;
	isActive: boolean;
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	isDisabled: boolean;
	onTogglePin?: (item: SidebarItem) => void;
	isPinned?: boolean;
	showIcon?: boolean;
	dataTestId?: string;
}): JSX.Element {
	const { label, icon, isBeta, isNew, isEarlyAccess, tooltip } = item;
	const shortcutLabel = isPinned
		? `Remove ${typeof label === 'string' ? label : 'item'} from shortcuts`
		: `Add ${typeof label === 'string' ? label : 'item'} to shortcuts`;

	const handleTogglePinClick = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	): void => {
		event.stopPropagation();
		if (!isDisabled) {
			onTogglePin?.(item);
		}
	};

	const navItem = (
		<div className="nav-item-row">
			<button
				className={cx(
					'nav-item',
					isActive ? 'active' : '',
					isDisabled ? 'disabled' : '',
				)}
				type="button"
				aria-label={typeof label === 'string' ? label : undefined}
				disabled={isDisabled}
				tabIndex={isDisabled ? -1 : 0}
				aria-current={isActive ? 'page' : undefined}
				aria-disabled={isDisabled}
				onClick={(event): void => {
					if (isDisabled) {
						return;
					}
					onClick(event);
				}}
				data-testid={dataTestId ?? `nav-item-${item.key}`}
			>
				{showIcon && <span className="nav-item-active-marker" />}
				<span className={cx('nav-item-data', isBeta ? 'beta-tag' : '')}>
					{showIcon && (
						<span className={cx('nav-item-icon', isEarlyAccess ? 'noz-wave' : '')}>
							{icon}
						</span>
					)}

					<span className="nav-item-label">{label}</span>

					{isBeta && (
						<span className="nav-item-beta">
							<Badge color="robin" className="sidenav-beta-tag">
								Beta
							</Badge>
						</span>
					)}

					{isNew && (
						<span className="nav-item-new">
							<Badge color="robin" className="sidenav-new-tag">
								New
							</Badge>
						</span>
					)}

					{isEarlyAccess && (
						<span className="nav-item-early-access">
							<Badge color="robin">Early Access</Badge>
						</span>
					)}
				</span>
			</button>
			{onTogglePin && (
				<Tooltip
					title={isPinned ? 'Remove from shortcuts' : 'Add to shortcuts'}
					placement="right"
				>
					<button
						type="button"
						className="nav-pin-button"
						aria-label={shortcutLabel}
						aria-pressed={isPinned}
						disabled={isDisabled}
						data-testid={`nav-pin-${item.key}`}
						onClick={handleTogglePinClick}
					>
						{isPinned ? <PinOff size={14} /> : <Pin size={14} />}
					</button>
				</Tooltip>
			)}
		</div>
	);

	// Only non-pinnable items set `tooltip`; it would nest with the pin tooltip.
	return tooltip ? (
		<Tooltip title={tooltip} placement="right">
			{navItem}
		</Tooltip>
	) : (
		navItem
	);
}

NavItem.defaultProps = {
	onTogglePin: undefined,
	isPinned: false,
	showIcon: false,
	dataTestId: undefined,
};
