import AppRoutes from 'AppRoutes';
import LandingPage from 'pages/Landing/LandingPage';
import { useLandingRoute } from 'pages/Landing/useLandingRoute';
import { AppProvider } from 'providers/App/App';

function ApplicationRoot(): JSX.Element {
	const isLanding = useLandingRoute();
	return isLanding ? (
		<LandingPage />
	) : (
		<AppProvider>
			<AppRoutes />
		</AppProvider>
	);
}

export default ApplicationRoot;
