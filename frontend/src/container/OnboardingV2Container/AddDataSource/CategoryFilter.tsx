import styles from './CategoryFilter.module.scss';

interface CategoryFilterProps {
	label: string;
	count: number;
	selected: boolean;
	onSelect: () => void;
}

function CategoryFilter({
	label,
	count,
	selected,
	onSelect,
}: CategoryFilterProps): JSX.Element {
	return (
		<button
			type="button"
			className={`onboarding-data-source-category-item ${styles.button}`}
			aria-pressed={selected}
			data-testid={`category-filter-${label}`}
			onClick={onSelect}
		>
			<span
				className={`onboarding-filters-item-title ${selected ? 'selected' : ''}`}
			>
				{label}
			</span>
			<span className="line-divider" aria-hidden="true" />
			<span className="onboarding-filters-item-count">{count}</span>
		</button>
	);
}

export default CategoryFilter;
