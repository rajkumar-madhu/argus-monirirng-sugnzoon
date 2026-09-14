import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NavItem from './NavItem';

describe('NavItem keyboard navigation', () => {
	it.each(['{Enter}', ' '])('activates an enabled item with %s', async (key) => {
		const onClick = jest.fn();
		render(
			<NavItem
				item={{ key: 'home', label: 'Home' }}
				isActive
				isDisabled={false}
				onClick={onClick}
				dataTestId="home-nav"
			/>,
		);
		const item = screen.getByTestId('home-nav');
		expect(item).toHaveAttribute('tabindex', '0');
		expect(item).toHaveAttribute('aria-current', 'page');
		expect(item).toHaveAccessibleName('Home');
		item.focus();
		await userEvent.keyboard(key);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('does not activate a disabled item by keyboard or pointer', () => {
		const onClick = jest.fn();
		render(
			<NavItem
				item={{ key: 'home', label: 'Home' }}
				isActive={false}
				isDisabled
				onClick={onClick}
				dataTestId="home-nav"
			/>,
		);
		const item = screen.getByTestId('home-nav');
		expect(item).toHaveAttribute('aria-disabled', 'true');
		expect(item).toHaveAttribute('tabindex', '-1');
		fireEvent.keyDown(item, { key: 'Enter' });
		fireEvent.click(item);
		expect(onClick).not.toHaveBeenCalled();
	});

	it('pins without navigating when the shortcut control is activated', () => {
		const onClick = jest.fn();
		const onTogglePin = jest.fn();
		const item = { key: 'home', label: 'Home' };
		render(
			<NavItem
				item={item}
				isActive={false}
				isDisabled={false}
				onClick={onClick}
				onTogglePin={onTogglePin}
				dataTestId="home-nav"
			/>,
		);
		const pin = screen.getByTestId('nav-pin-home');
		expect(pin.tagName).toBe('BUTTON');
		fireEvent.keyDown(pin, { key: 'Enter' });
		fireEvent.click(pin);
		expect(onTogglePin).toHaveBeenCalledWith(item);
		expect(onClick).not.toHaveBeenCalled();
	});
});
