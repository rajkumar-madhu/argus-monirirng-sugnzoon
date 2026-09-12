import ROUTES from './routes';

/**
 * Public docs / marketing site base.
 * Override with VITE_DOCS_BASE_URL at build time.
 * Defaults to https://signoz.io because this fork does not ship its own docs site;
 * product UI branding remains Argus. Do not default to argus.example.com — that
 * domain is a placeholder and shows up broken in empty states / auth footer.
 */
export const DOCS_BASE_URL = process.env.DOCS_BASE_URL || 'https://signoz.io';

export const GITHUB_REPO_URL =
	'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon';

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
