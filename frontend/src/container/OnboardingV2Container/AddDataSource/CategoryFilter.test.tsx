import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';

import CategoryFilter from './CategoryFilter';

describe('CategoryFilter', () => {
	it('activates exactly once with Enter, Space, and a pointer without submitting a form', async () => {
		const user = userEvent.setup();
		const onSelect = jest.fn();
		const onSubmit = jest.fn((event: FormEvent<HTMLFormElement>) =>
			event.preventDefault(),
		);
		render(
			<form onSubmit={onSubmit}>
				<CategoryFilter
					label="Logs"
					count={3}
					selected={false}
					onSelect={onSelect}
				/>
			</form>,
		);
		const button = screen.getByTestId('category-filter-Logs');
		expect(button.tagName).toBe('BUTTON');
		expect(button).toHaveAttribute('aria-pressed', 'false');
		await user.tab();
		expect(button).toHaveFocus();
		await user.keyboard('{Enter}');
		expect(onSelect).toHaveBeenCalledTimes(1);
		await user.keyboard(' ');
		expect(onSelect).toHaveBeenCalledTimes(2);
		await user.click(button);
		expect(onSelect).toHaveBeenCalledTimes(3);
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('exposes the selected category and its count', () => {
		render(
			<CategoryFilter label="All" count={12} selected onSelect={jest.fn()} />,
		);
		const button = screen.getByTestId('category-filter-All');
		expect(button).toHaveAttribute('aria-pressed', 'true');
		expect(button).toHaveTextContent('All');
		expect(button).toHaveTextContent('12');
	});
});
