import { act, renderHook } from '@testing-library/react';
import { ThemeProvider, useIsDarkMode, useThemeMode } from '../index';

const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
	<ThemeProvider>{children}</ThemeProvider>
);

describe('WeCrew light-only theme', () => {
	beforeEach(() => {
		localStorage.clear();
	});
	it('starts light without stored preferences', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper });
		expect(result.current.theme).toBe('light');
		expect(result.current.autoSwitch).toBe(false);
	});
	it('ignores and replaces saved dark and automatic preferences', () => {
		localStorage.setItem('THEME', 'dark');
		localStorage.setItem('THEME_AUTO_SWITCH', 'true');
		const { result } = renderHook(() => useThemeMode(), { wrapper });
		expect(result.current.theme).toBe('light');
		expect(localStorage.getItem('THEME')).toBe('light');
		expect(localStorage.getItem('THEME_AUTO_SWITCH')).toBe('false');
	});
	it('cannot switch to dark through any exposed theme controls', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper });
		act(() => {
			result.current.setTheme('dark');
			result.current.toggleTheme();
			result.current.setAutoSwitch(true);
		});
		expect(result.current.theme).toBe('light');
		expect(result.current.autoSwitch).toBe(false);
	});
	it('uses light mode when storage is unavailable', () => {
		const spy = jest
			.spyOn(Storage.prototype, 'setItem')
			.mockImplementation(() => {
				throw new Error('Storage unavailable');
			});
		try {
			const { result } = renderHook(() => useIsDarkMode(), { wrapper });
			expect(result.current).toBe(false);
		} finally {
			spy.mockRestore();
		}
	});
});
