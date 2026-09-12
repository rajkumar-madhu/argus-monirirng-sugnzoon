import ROUTES from './routes';

export const GITHUB_REPO_URL =
	'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon';

/** Vendor-neutral instrumentation docs. Argus does not ship a docs site. */
export const INSTRUMENTATION_DOCS_URL =
	process.env.INSTRUMENTATION_DOCS_URL ||
	'https://opentelemetry.io/docs/languages/';

/**
 * Public docs / help base.
 * Override with VITE_DOCS_BASE_URL when Argus has its own docs host.
 * Do not default to signoz.io (upstream branding) or argus.example.com (404 placeholder).
 */
export const DOCS_BASE_URL = process.env.DOCS_BASE_URL || GITHUB_REPO_URL;

export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;

/** Community support destination until Argus has its own Slack. */
export const COMMUNITY_URL = GITHUB_ISSUES_URL;

export const WITHOUT_SESSION_PATH = ['/redirect'];

export const AUTH0_REDIRECT_PATH = '/redirect';

export const DEFAULT_AUTH0_APP_REDIRECTION_PATH = ROUTES.APPLICATION;

export const INVITE_MEMBERS_HASH = '#invite-team-members';

export const DASHBOARD_TIME_IN_DURATION = 'refreshInterval';

export const DEFAULT_ENTITY_VERSION = 'v3';
export const ENTITY_VERSION_V4 = 'v4';
export const ENTITY_VERSION_V5 = 'v5';
