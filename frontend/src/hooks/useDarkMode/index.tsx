import {
	// eslint-disable-next-line no-restricted-imports
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useCallback,
	// eslint-disable-next-line no-restricted-imports
	useContext,
	useEffect,
	useMemo,
} from 'react';
import { theme as antdTheme, ThemeConfig } from 'antd';
import set from 'api/browser/localstorage/set';
import { LOCALSTORAGE } from 'constants/localStorage';

import { THEME_MODE } from './constant';

export const ThemeContext = createContext({
	theme: THEME_MODE.LIGHT,
	toggleTheme: (): void => {},
	autoSwitch: false,
	setAutoSwitch: ((): void => {}) as Dispatch<SetStateAction<boolean>>,
	setTheme: ((): void => {}) as Dispatch<SetStateAction<string>>,
});

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
	// Preserve the hook API for existing consumers while enforcing light-only UI.
	const keepLightTheme = useCallback((): void => {
		try {
			set(LOCALSTORAGE.THEME, THEME_MODE.LIGHT);
			set(LOCALSTORAGE.THEME_AUTO_SWITCH, 'false');
		} catch {
			// Rendering stays light even when browser storage is unavailable.
		}
	}, []);
	useEffect(keepLightTheme, [keepLightTheme]);
	const value = useMemo(
		() => ({
			theme: THEME_MODE.LIGHT,
			autoSwitch: false,
			toggleTheme: keepLightTheme,
			setTheme: keepLightTheme,
			setAutoSwitch: keepLightTheme,
		}),
		[keepLightTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

interface ThemeProviderProps {
	children: ReactNode;
}

interface ThemeMode {
	theme: string;
	toggleTheme: () => void;
	autoSwitch: boolean;
	setAutoSwitch: Dispatch<SetStateAction<boolean>>;
	setTheme: (newTheme: string) => void;
}

export const useThemeMode = (): ThemeMode => {
	const { theme, toggleTheme, autoSwitch, setAutoSwitch, setTheme } =
		useContext(ThemeContext);

	return { theme, toggleTheme, autoSwitch, setAutoSwitch, setTheme };
};

export const useIsDarkMode = (): boolean => {
	const { theme } = useContext(ThemeContext);

	return theme === THEME_MODE.DARK;
};

export const useThemeConfig = (): ThemeConfig => {
	const isDarkMode = useIsDarkMode();

	return {
		algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
		token: {
			borderRadius: 2,
			borderRadiusLG: 2,
			borderRadiusSM: 2,
			borderRadiusXS: 2,
			fontFamily: 'Inter',
			fontSize: 13,
			colorPrimary: '#4E74F8',
			colorBgBase: isDarkMode ? '#0B0C0E' : '#fff',
			colorBgContainer: isDarkMode ? '#121317' : '#fff',
			colorLink: '#4E74F8',
			colorPrimaryText: '#3F5ECC',
		},
		components: {
			Dropdown: {
				colorBgElevated: isDarkMode ? '#121317' : '#fff',
				controlItemBgHover: isDarkMode ? '#1D212D' : '#fff',
				colorText: isDarkMode ? '#C0C1C3' : '#121317',
				fontSize: 12,
			},
			Select: {
				colorBgElevated: isDarkMode ? '#121317' : '#fff',
				controlItemBgHover: isDarkMode ? '#1D212D' : '#fff',
				boxShadowSecondary: isDarkMode
					? '4px 10px 16px 2px rgba(0, 0, 0, 0.30)'
					: '#fff',
				colorText: isDarkMode ? '#C0C1C3' : '#121317',
				fontSize: 12,
			},
			Button: {
				paddingInline: 12,
				fontSize: 12,
			},
			Input: {
				colorBorder: isDarkMode ? '#1D212D' : '#E9E9E9',
			},
			Breadcrumb: {
				separatorMargin: 4,
			},
		},
	};
};

export default useThemeMode;
