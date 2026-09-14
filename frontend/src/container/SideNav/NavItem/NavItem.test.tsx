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

	it('pins without navigating when the shortcut control is activated', async () => {
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
		expect(pin).toHaveAccessibleName('Add Home to shortcuts');
		pin.focus();
		await userEvent.keyboard('{Enter}');
		expect(onTogglePin).toHaveBeenCalledWith(item);
		expect(onTogglePin).toHaveBeenCalledTimes(1);
		expect(onClick).not.toHaveBeenCalled();
	});

	it('provides a stable selector without an explicit test ID', () => {
		render(
			<NavItem
				item={{ key: '/home', label: 'Home' }}
				isActive={false}
				isDisabled={false}
				onClick={jest.fn()}
			/>,
		);
		expect(screen.getByTestId('nav-item-/home')).toHaveAccessibleName('Home');
	});

	it('does not pin a disabled item', async () => {
		const onTogglePin = jest.fn();
		render(
			<NavItem
				item={{ key: 'home', label: 'Home' }}
				isActive={false}
				isDisabled
				onClick={jest.fn()}
				onTogglePin={onTogglePin}
			/>,
		);
		const pin = screen.getByTestId('nav-pin-home');
		expect(pin).toBeDisabled();
		await userEvent.click(pin);
		expect(onTogglePin).not.toHaveBeenCalled();
	});
});
