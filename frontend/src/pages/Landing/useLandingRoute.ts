import { useEffect, useState } from 'react';
import history from 'lib/history';

export function useLandingRoute(): boolean {
	const [pathname, setPathname] = useState(history.location.pathname);
	useEffect(() => {
		const unsubscribe = history.listen((location) =>
			setPathname(location.pathname),
		);
		setPathname(history.location.pathname);
		return unsubscribe;
	}, []);
	return pathname === '/';
}
