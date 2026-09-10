import getLocalStorageApi from 'api/browser/localstorage/get';
import setLocalStorageApi from 'api/browser/localstorage/set';
import { LOCALSTORAGE } from 'constants/localStorage';
import { ENVIRONMENT } from 'constants/env';
import { getBaseUrl } from 'utils/basePath';

/**
 * Resolves the Argus instance URL sent to the AI Assistant backend via the
 * `X-Argus-URL` header. Resolution order:
 *
 *   1. `ACTIVE_ARGUS_INSTANCE_URL` localStorage override (cloud instance switcher).
 *   2. `ENVIRONMENT.baseURL` — the build-time absolute endpoint
 *      (`VITE_FRONTEND_API_ENDPOINT`). Non-empty on cloud builds.
 *   3. `getBaseUrl()` (origin + base path) — fallback for self-hosted builds.
 */
export function getArgusInstanceUrl(): string {
	const fromStorage = getLocalStorageApi(
		LOCALSTORAGE.ACTIVE_ARGUS_INSTANCE_URL,
	);

	if (typeof fromStorage === 'string' && fromStorage.trim().length > 0) {
		return fromStorage;
	}

	if (ENVIRONMENT.baseURL) {
		return ENVIRONMENT.baseURL;
	}

	return getBaseUrl();
}

export function setArgusInstanceUrl(url: string | null | undefined): void {
	const next = (url ?? '').trim();

	if (!next) {
		return;
	}

	setLocalStorageApi(LOCALSTORAGE.ACTIVE_ARGUS_INSTANCE_URL, next);
}
